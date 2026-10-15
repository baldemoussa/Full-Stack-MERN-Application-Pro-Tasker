const { Comment, Project, Task, User } = require('../models');
const { accessLevel, canEdit, canView, idOf, inactiveMessage, isActive, presentProject } = require('../utils/access');

const collaboratorFields = 'username email fullName position profilePhoto';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function loadProject(id) {
  return Project.findById(id)
    .populate('user', collaboratorFields)
    .populate('collaborators.user', collaboratorFields);
}

function writableFields(body) {
  const updates = { ...body };
  delete updates.user;
  delete updates.collaborators;
  delete updates.access;
  delete updates.status;
  return updates;
}

async function createProject(req, res) {
  try {
    const created = await Project.create({
      ...writableFields(req.body),
      user: req.user._id,
      collaborators: [],
      status: 'active',
    });
    const project = await loadProject(created._id);
    res.status(201).json(presentProject(project, req.user._id));
  } catch (err) {
    res.status(400).json(err);
  }
}

async function getAllProjects(req, res) {
  try {
    const projects = await Project.find({
      $or: [
        { user: req.user._id },
        { 'collaborators.user': req.user._id },
      ],
    })
      .populate('user', collaboratorFields)
      .populate('collaborators.user', collaboratorFields);

    res.json(projects.map((project) => presentProject(project, req.user._id)));
  } catch (err) {
    res.status(500).json(err);
  }
}

async function getProjectById(req, res) {
  try {
    const project = await loadProject(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'No project found with this id!' });
    }
    if (!canView(accessLevel(project, req.user._id))) {
      return res.status(403).json({ message: 'User is not authorized to view this project.' });
    }
    res.json(presentProject(project, req.user._id));
  } catch (err) {
    res.status(500).json(err);
  }
}

async function updateProject(req, res) {
  try {
    const project = await loadProject(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'No project found with this id!' });
    }
    if (!canEdit(accessLevel(project, req.user._id))) {
      return res.status(403).json({ message: 'User is not authorized to update this project.' });
    }
    if (!isActive(project)) {
      return res.status(403).json({ message: inactiveMessage(project) });
    }

    Object.assign(project, writableFields(req.body));
    await project.save();
    res.json(presentProject(project, req.user._id));
  } catch (err) {
    res.status(500).json(err);
  }
}

async function deleteProject(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'No project found with this id!' });
    }
    if (accessLevel(project, req.user._id) !== 'owner') {
      return res.status(403).json({ message: 'User is not authorized to delete this project.' });
    }
    const tasks = await Task.find({ project: project._id }).select('_id');
    await Comment.deleteMany({ task: { $in: tasks.map((task) => task._id) } });
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted!' });
  } catch (err) {
    res.status(500).json(err);
  }
}

async function addCollaborator(req, res) {
  try {
    const project = await loadProject(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'No project found with this id!' });
    }
    if (accessLevel(project, req.user._id) !== 'owner') {
      return res.status(403).json({ message: 'Only the project owner can invite collaborators.' });
    }
    if (!isActive(project)) {
      return res.status(403).json({ message: inactiveMessage(project) });
    }

    const email = String(req.body.email || '').trim();
    const permission = req.body.permission;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    if (permission !== 'view' && permission !== 'edit') {
      return res.status(400).json({ message: 'Permission must be view or edit.' });
    }

    const invitee = await User.findOne({
      email: new RegExp(`^${escapeRegex(email)}$`, 'i'),
    });
    if (!invitee) {
      return res.status(404).json({ message: 'No registered user with that email.' });
    }
    if (idOf(invitee._id) === idOf(project.user)) {
      return res.status(400).json({ message: 'The owner is already on this project.' });
    }

    const existing = project.collaborators.find((entry) => idOf(entry.user) === idOf(invitee._id));
    if (existing) {
      existing.permission = permission;
    } else {
      project.collaborators.push({ user: invitee._id, permission });
    }

    await project.save();
    await project.populate('collaborators.user', collaboratorFields);
    res.status(existing ? 200 : 201).json(presentProject(project, req.user._id));
  } catch (err) {
    res.status(400).json(err);
  }
}

async function removeCollaborator(req, res) {
  try {
    const project = await loadProject(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'No project found with this id!' });
    }
    if (accessLevel(project, req.user._id) !== 'owner') {
      return res.status(403).json({ message: 'Only the project owner can remove collaborators.' });
    }
    if (!isActive(project)) {
      return res.status(403).json({ message: inactiveMessage(project) });
    }

    const entry = project.collaborators.find((item) => idOf(item.user) === req.params.userId);
    if (!entry) {
      return res.status(404).json({ message: 'That person is not a collaborator on this project.' });
    }
    project.collaborators.pull(entry._id);

    await project.save();
    await project.populate('collaborators.user', collaboratorFields);
    res.json(presentProject(project, req.user._id));
  } catch (err) {
    res.status(500).json(err);
  }
}

async function setProjectStatus(req, res, status) {
  try {
    const project = await loadProject(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'No project found with this id!' });
    }
    if (accessLevel(project, req.user._id) !== 'owner') {
      return res.status(403).json({ message: 'Only the project owner can change this project.' });
    }

    const current = project.status || 'active';
    if (current === status) {
      const label = status === 'active' ? 'open' : status;
      return res.status(400).json({ message: `This project is already ${label}.` });
    }

    project.status = status;
    await project.save();
    res.json(presentProject(project, req.user._id));
  } catch (err) {
    res.status(500).json(err);
  }
}

function closeProject(req, res) {
  return setProjectStatus(req, res, 'closed');
}

function archiveProject(req, res) {
  return setProjectStatus(req, res, 'archived');
}

function reopenProject(req, res) {
  return setProjectStatus(req, res, 'active');
}

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addCollaborator,
  removeCollaborator,
  closeProject,
  archiveProject,
  reopenProject,
};
