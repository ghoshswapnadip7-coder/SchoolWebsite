const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

EventSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

EventSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; }
});

module.exports = mongoose.model('Event', EventSchema);
