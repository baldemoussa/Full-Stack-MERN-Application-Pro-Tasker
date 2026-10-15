const {Schema, model} = require('mongoose');

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['To Do', 'In Progress', 'Hold', 'Done'],
        default: 'To Do',
    },
    priority: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium',
    },
    assignees: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    }
}, {
    timestamps: true
});

const Task = model('Task', taskSchema);

module.exports = Task;