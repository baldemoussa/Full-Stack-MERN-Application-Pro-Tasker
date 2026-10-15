// Task CRUD for one project. A task can be assigned only to someone the project was shared with. A drag sends status only and leaves the other fields alone.
const { Comment, Project, Task } = require('../models');
const { accessLevel, canEdit, canView, idOf, inactiveMessage, isActive } = require('../utils/access');

const assigneeFields = 'username email fullName position profilePhoto';

// Older tasks have no priority. The board treats those as Medium.
function presentTask(task, project) {
  const plain = task.toObject();
  if (!plain.priority) {
    plain.priority = 'Medium';
  }
  const shared = new Set(sharedIds(project));
  plain.assignees = (plain.assignees || []).filter((person) => person && shared.has(idOf(person)));
  plain.dueDate = plain.dueDate ? new Date(plain.dueDate).toISOString().slice(0, 10) : null;
  return plain;
}

// undefined means "do not change it", which is what a drag-and-drop update does.
function readDueDate(value) {
  if (value === undefined) {
    return { skip: true };
  }
  if (value === null || value === '') {
    return { date: null };
  }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { error: 'Due date must be a valid date.' };
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  const sameDay = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  if (!sameDay) {
    return { error: 'Due date must be a valid date.' };
  }
  return { date };
}

function sharedIds(project) {
  return (project.collaborators || []).map((entry) => idOf(entry.user)).filter(Boolean);
}

// Only people the project was shared with can be assigned. Duplicates are dropped.
function assigneeList(value, project) {
  if (!Array.isArray(value)) {
    return { error: 'Assignees must be a list of people this project was shared with.' };
  }

  const allowed = new Set(sharedIds(project));
  const ids = [];
  for (const item of value) {
    const id = idOf(item);
    if (!id || !allowed.has(id)) {
      return { error: 'Tasks can only be assigned to someone this project was shared with.' };
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

    const { assignees, dueDate, ...fields } = req.body;
    const assigned = assigneeList(assignees ?? [], project);
    if (assigned.error) {
      return res.status(400).json({ message: assigned.error });
    }
    const due = readDueDate(dueDate === undefined ? null : dueDate);
    if (due.error) {
      return res.status(400).json({ message: due.error });
    }

    const task = await Task.create({
      ...fields,
      assignees: assigned.ids,
      dueDate: due.date,
      project: req.params.projectId,
    });
    await task.populate('assignees', assigneeFields);
    res.status(201).json(presentTask(task, project));
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
    res.json(tasks.map((task) => presentTask(task, project)));
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
    if (updates.dueDate !== undefined) {
      const due = readDueDate(updates.dueDate);
      if (due.error) {
        return res.status(400).json({ message: due.error });
      }
      updates.dueDate = due.date;
    }
    const updatedTask = await Task.findByIdAndUpdate(req.params.taskId, updates, {
      returnDocument: 'after',
      runValidators: true,
    });
    await updatedTask.populate('assignees', assigneeFields);
    res.json(presentTask(updatedTask, project));
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
