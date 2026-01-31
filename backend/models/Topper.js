const mongoose = require('mongoose');

const TopperSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    rank: {
        type: String,
        required: true // e.g., "1st", "Star Student"
    },
    imageUrl: {
        type: String
    },
    videoUrl: {
        type: String // YouTube or direct link
    },
    message: {
        type: String // Admin's words for the student
    },
    details: {
        type: String // Achievements or contact info
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

TopperSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

TopperSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; }
});

module.exports = mongoose.model('Topper', TopperSchema);
