const { Project, Task } = require('../models');

async function createProject(req, res) {
  try {
    const project = await Project.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json(err);
  }
}

async function getAllProjects(req, res) {
  try {
    const projects = await Project.find({ user: req.user._id });
    res.json(projects);
  } catch (err) {
    res.status(500).json(err);
  }
}

async function getProjectById(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'No project found with this id!' });
    }
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User is not authorized to view this project.' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json(err);
  }
}

async function updateProject(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'No project found with this id!' });
    }
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User is not authorized to update this project.' });
    }

    const updates = { ...req.body };
    delete updates.user;
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedProject);
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
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User is not authorized to delete this project.' });
    }
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted!' });
  } catch (err) {
    res.status(500).json(err);
  }
}

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
