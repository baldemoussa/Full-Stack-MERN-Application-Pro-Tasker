const { Comment, Project, Task } = require('../models');
const { accessLevel, canEdit, canView, idOf, inactiveMessage, isActive } = require('../utils/access');

const assigneeFields = 'username email fullName position profilePhoto';

function presentTask(task) {
  const plain = task.toObject();
  if (!plain.priority) {
    plain.priority = 'Medium';
  }
  plain.assignees = (plain.assignees || []).filter(Boolean);
  return plain;
}

function memberIds(project) {
  return [idOf(project.user), ...(project.collaborators || []).map((entry) => idOf(entry.user))].filter(Boolean);
}

function assigneeList(value, project) {
  if (!Array.isArray(value)) {
    return { error: 'Assignees must be a list of people on this project.' };
  }

  const allowed = new Set(memberIds(project));
  const ids = [];
  for (const item of value) {
    const id = idOf(item);
    if (!id || !allowed.has(id)) {
      return { error: 'Tasks can only be assigned to the owner or a collaborator.' };
    }
    if (!ids.includes(id)) {
      ids.push(id);
    }
  }
  return { ids };
}

async function createTask(req, res) {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'No project found with this id!' });
    }
    if (!canEdit(accessLevel(project, req.user._id))) {
      return res.status(403).json({ message: 'User is not authorized to create a task for this project.' });
    }
    if (!isActive(project)) {
      return res.status(403).json({ message: inactiveMessage(project) });
    }

    const { assignees, ...fields } = req.body;
    const assigned = assigneeList(assignees ?? [], project);
    if (assigned.error) {
      return res.status(400).json({ message: assigned.error });
    }

    const task = await Task.create({
      ...fields,
      assignees: assigned.ids,
      project: req.params.projectId,
    });
    await task.populate('assignees', assigneeFields);
    res.status(201).json(presentTask(task));
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
    if (!canView(accessLevel(project, req.user._id))) {
      return res.status(403).json({ message: 'User is not authorized to view tasks for this project.' });
    }

    const tasks = await Task.find({ project: req.params.projectId }).populate('assignees', assigneeFields);
    res.json(tasks.map(presentTask));
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
    if (!canEdit(accessLevel(project, req.user._id))) {
      return res.status(403).json({ message: 'User is not authorized to update this task.' });
    }
    if (!isActive(project)) {
      return res.status(403).json({ message: inactiveMessage(project) });
    }

    const updates = { ...req.body };
    delete updates.project;
    if (updates.assignees !== undefined) {
      const assigned = assigneeList(updates.assignees, project);
      if (assigned.error) {
        return res.status(400).json({ message: assigned.error });
      }
      updates.assignees = assigned.ids;
    }
    const updatedTask = await Task.findByIdAndUpdate(req.params.taskId, updates, {
      returnDocument: 'after',
      runValidators: true,
    });
    await updatedTask.populate('assignees', assigneeFields);
    res.json(presentTask(updatedTask));
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
    if (!canEdit(accessLevel(project, req.user._id))) {
      return res.status(403).json({ message: 'User is not authorized to delete this task.' });
    }
    if (!isActive(project)) {
      return res.status(403).json({ message: inactiveMessage(project) });
    }

    await Comment.deleteMany({ task: task._id });
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
