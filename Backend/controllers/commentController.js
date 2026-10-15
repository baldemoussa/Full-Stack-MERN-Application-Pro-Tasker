const { Comment, Project, Task } = require('../models');
const { accessLevel, canView, idOf, inactiveMessage, isActive } = require('../utils/access');

const authorFields = 'username fullName position profilePhoto';

async function loadTaskProject(req) {
  const task = await Task.findById(req.params.taskId);
  if (!task || task.project.toString() !== req.params.projectId) {
    return { error: { status: 404, message: 'No task found with this id!' } };
  }

  const project = await Project.findById(task.project);
  if (!project) {
    return { error: { status: 404, message: 'No project found with this id!' } };
  }

  if (!canView(accessLevel(project, req.user._id))) {
    return { error: { status: 403, message: 'User is not authorized to view this task.' } };
  }

  return { task, project, level: accessLevel(project, req.user._id) };
}

async function getComments(req, res) {
  try {
    const loaded = await loadTaskProject(req);
    if (loaded.error) {
      return res.status(loaded.error.status).json({ message: loaded.error.message });
    }

    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', authorFields)
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
}

async function createComment(req, res) {
  try {
    const loaded = await loadTaskProject(req);
    if (loaded.error) {
      return res.status(loaded.error.status).json({ message: loaded.error.message });
    }
    if (!isActive(loaded.project)) {
      return res.status(403).json({ message: inactiveMessage(loaded.project) });
    }

    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    let parent = null;
    if (req.body.parent) {
      const parentComment = await Comment.findById(req.body.parent);
      if (!parentComment || parentComment.task.toString() !== req.params.taskId) {
        return res.status(404).json({ message: 'No comment found with this id!' });
      }
      if (parentComment.parent) {
        return res.status(400).json({ message: 'A reply cannot have its own replies.' });
      }
      parent = parentComment._id;
    }

    const comment = await Comment.create({
      text,
      task: req.params.taskId,
      user: req.user._id,
      parent,
    });
    await comment.populate('user', authorFields);
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json(err);
  }
}

async function deleteComment(req, res) {
  try {
    const loaded = await loadTaskProject(req);
    if (loaded.error) {
      return res.status(loaded.error.status).json({ message: loaded.error.message });
    }
    if (!isActive(loaded.project)) {
      return res.status(403).json({ message: inactiveMessage(loaded.project) });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment || comment.task.toString() !== req.params.taskId) {
      return res.status(404).json({ message: 'No comment found with this id!' });
    }

    const isAuthor = idOf(comment.user) === idOf(req.user._id);
    if (!isAuthor && loaded.level !== 'owner') {
      return res.status(403).json({ message: 'User is not authorized to delete this comment.' });
    }

    await Comment.deleteMany({ $or: [{ _id: comment._id }, { parent: comment._id }] });
    res.json({ message: 'Comment deleted!' });
  } catch (err) {
    res.status(500).json(err);
  }
}

module.exports = {
  getComments,
  createComment,
  deleteComment,
};
