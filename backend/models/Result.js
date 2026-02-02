const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    marks: {
        type: Number,
        required: true
    },
    projectMarks: {
        type: Number,
        default: 0
    },
    grade: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    className: {
        type: String,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ResultSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

ResultSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; }
});

module.exports = mongoose.model('Result', ResultSchema);
