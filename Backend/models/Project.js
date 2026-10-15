// A board owned by one user. Collaborators are invited people with view or edit permission. Status is active, closed, or archived.
const {Schema, model} = require('mongoose');

const projectSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'archived'],
        default: 'active',
    },
    collaborators: {
        type: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            permission: {
                type: String,
                enum: ['view', 'edit'],
                required: true,
            },
        }],
        default: [],
    },
}, {
    timestamps: true
});

const Project = model('Project', projectSchema);

module.exports = Project;