const mongoose = require('mongoose');

const RoutineSchema = new mongoose.Schema({
    class: {
        type: String,
        required: true
    },
    day: {
        type: String, // Monday, Tuesday, etc.
        required: true
    },
    periods: [{
        subject: String,
        teacher: String,
        startTime: String,
        endTime: String,
        room: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

RoutineSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

RoutineSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; }
});

module.exports = mongoose.model('Routine', RoutineSchema);
