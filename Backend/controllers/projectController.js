// Project CRUD, invites, and close, archive, and reopen. Only the owner changes membership or project status.
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

// Name and description only. Invites are applied separately so a caller cannot replace the owner or the stored list directly.
function writableFields(body) {
  const updates = { ...body };
  delete updates.user;
  delete updates.collaborators;
  delete updates.invites;
  delete updates.removeCollaboratorIds;
  delete updates.access;
  delete updates.status;
  return updates;
}

// Looks up each email before the project is saved. The same person is kept once.
async function resolveInvites(invites, ownerId) {
  if (!Array.isArray(invites)) {
    return { error: 'Collaborators must be a list.', status: 400 };
  }

  const entries = [];
  for (const invite of invites) {
    const email = String(invite?.email || '').trim();
    const permission = invite?.permission;
    if (!email) {
      return { error: 'Email is required.', status: 400 };
    }
    if (permission !== 'view' && permission !== 'edit') {
      return { error: 'Permission must be view or edit.', status: 400 };
    }

    const invitee = await User.findOne({
      email: new RegExp(`^${escapeRegex(email)}$`, 'i'),
    });
    if (!invitee) {
      return { error: 'No registered user with that email.', status: 404 };
    }
    if (idOf(invitee._id) === idOf(ownerId)) {
      return { error: 'The owner is already on this project.', status: 400 };
    }

    const existing = entries.find((entry) => idOf(entry.user) === idOf(invitee._id));
    if (existing) {
      existing.permission = permission;
    } else {
      entries.push({ user: invitee._id, permission });
    }
  }
  return { entries };
}

function applyInvites(project, entries) {
  for (const entry of entries) {
    const existing = project.collaborators.find((item) => idOf(item.user) === idOf(entry.user));
    if (existing) {
      existing.permission = entry.permission;
    } else {
      project.collaborators.push(entry);
    }
  }
}

function applyRemovals(project, ids) {
  const removed = [];
  for (const userId of [...new Set(ids.map((id) => String(id)))]) {
    const entry = project.collaborators.find((item) => idOf(item.user) === userId);
    if (!entry) {
      return { error: 'That person is not a collaborator on this project.', status: 404 };
    }
    removed.push(idOf(entry.user));
    project.collaborators.pull(entry._id);
  }
  return { removed };
}

async function createProject(req, res) {
  try {
    const invites = req.body.invites === undefined ? [] : req.body.invites;
    const resolved = await resolveInvites(invites, req.user._id);
    if (resolved.error) {
      return res.status(resolved.status).json({ message: resolved.error });
    }

    const created = await Project.create({
      ...writableFields(req.body),
      user: req.user._id,
      collaborators: resolved.entries,
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

    const invites = req.body.invites;
    const removeIds = req.body.removeCollaboratorIds;
    if (invites !== undefined && !Array.isArray(invites)) {
      return res.status(400).json({ message: 'Collaborators must be a list.' });
    }
    if (removeIds !== undefined && !Array.isArray(removeIds)) {
      return res.status(400).json({ message: 'Removed collaborators must be a list.' });
    }
    const changingMembers = (invites?.length || 0) > 0 || (removeIds?.length || 0) > 0;
    if (changingMembers && accessLevel(project, req.user._id) !== 'owner') {
      return res.status(403).json({ message: 'Only the project owner can change collaborators.' });
    }

    const resolved = invites === undefined ? { entries: [] } : await resolveInvites(invites, project.user);
    if (resolved.error) {
      return res.status(resolved.status).json({ message: resolved.error });
    }

    Object.assign(project, writableFields(req.body));
    const removal = removeIds === undefined ? { removed: [] } : applyRemovals(project, removeIds);
    if (removal.error) {
      return res.status(removal.status).json({ message: removal.error });
    }
    applyInvites(project, resolved.entries);
    await project.save();
    for (const userId of removal.removed) {
      await Task.updateMany({ project: project._id }, { $pull: { assignees: userId } });
    }
    await project.populate('collaborators.user', collaboratorFields);
    res.json(presentProject(project, req.user._id));
  } catch (err) {
    res.status(500).json(err);
  }
}

// Removes the project, its tasks, and the comments on those tasks.
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

// Taking someone off the project also takes them off every task assignment.
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
    await Task.updateMany({ project: project._id }, { $pull: { assignees: idOf(entry.user) } });
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
