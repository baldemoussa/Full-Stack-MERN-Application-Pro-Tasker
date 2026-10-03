const { Project, Task } = require('../models');

async function createTask(req, res) {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'No project found with this id!' });
    }
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User is not authorized to create a task for this project.' });
    }

    const task = await Task.create({
      ...req.body,
      project: req.params.projectId,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json(err);
  }
}

async function getAllTasks(req, res) {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'No project found with this id!' });
    }
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User is not authorized to view tasks for this project.' });
    }

    const tasks = await Task.find({ project: req.params.projectId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json(err);
  }
}

async function updateTask(req, res) {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task || task.project.toString() !== req.params.projectId) {
      return res.status(404).json({ message: 'No task found with this id!' });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'No project found with this id!' });
    }
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User is not authorized to update this task.' });
    }

    const updates = { ...req.body };
    delete updates.project;
    const updatedTask = await Task.findByIdAndUpdate(req.params.taskId, updates, { new: true });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json(err);
  }
}

async function deleteTask(req, res) {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task || task.project.toString() !== req.params.projectId) {
      return res.status(404).json({ message: 'No task found with this id!' });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'No project found with this id!' });
    }
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User is not authorized to delete this task.' });
    }

    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ message: 'Task deleted!' });
  } catch (err) {
    res.status(500).json(err);
  }
}

module.exports = {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
};
