// Re-exports the Mongoose models so controllers can require one file.
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const Comment = require('./Comment');

module.exports = { User, Project, Task, Comment };
