const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    attachments: [{
        type: String // URLs for uploaded files
    }],
    targetType: {
        type: String,
        enum: ['ALL', 'CLASS', 'STUDENT', 'TEACHER'],
        default: 'ALL'
    },
    targetId: {
        type: String, // Class name or Student ID
        required: false
    },
    status: {
        type: String,
        enum: ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'PENDING'],
        default: 'PUBLISHED'
    },
    scheduledFor: {
        type: Date,
        required: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notice', NoticeSchema);
