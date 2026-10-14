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