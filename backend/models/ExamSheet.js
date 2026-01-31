const mongoose = require('mongoose');

const ExamSheetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true // e.g., "Mathematics Term 1"
    },
    sheetUrl: {
        type: String, // Link to the uploaded image/pdf
        required: true
    },
    examDate: {
        type: Date,
        default: Date.now
    },
    semester: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ExamSheetSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

ExamSheetSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; }
});

module.exports = mongoose.model('ExamSheet', ExamSheetSchema);
