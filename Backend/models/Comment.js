// A note on a task. parent is empty for a top-level comment and points at that comment for a reply.
const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
}, {
  timestamps: true,
});

const Comment = model('Comment', commentSchema);

module.exports = Comment;
