// A card on a project. Status chooses the column. Priority, due date, and assignees are optional details on that card.
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
    dueDate: {
        type: Date,
        default: null,
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