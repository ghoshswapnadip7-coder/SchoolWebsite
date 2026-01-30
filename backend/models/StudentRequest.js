const mongoose = require('mongoose');

const StudentRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String, // e.g., 'LEAVE', 'RESULT_ISSUE', 'OTHER'
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'DECLINED'],
        default: 'PENDING'
    },
    adminComment: {
        type: String
    },
    requestedProfilePic: {
        type: String // URL of the new profile picture student wants to use
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

StudentRequestSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

StudentRequestSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; }
});

module.exports = mongoose.model('StudentRequest', StudentRequestSchema);
