const mongoose = require('mongoose');

const RegistrationRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        unique: true,
        sparse: true
    },
    class: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    stream: {
        type: String, // 'Science' or 'Arts' (Only for Class 11/12)
        required: false
    },
    subjects: {
        type: [String], // List of selected subjects
        required: false
    },
    applicationType: {
        type: String,
        enum: ['FRESH', 'PROMOTION'],
        default: 'FRESH'
    },
    previousStudentId: {
        type: String,
        required: false
    },
    documents: {
        aadharCard: String, // URL/Link to image/pdf
        pastMarksheet: String,
        birthCertificate: String,
        transferCertificate: String
    },
    password: { // Store chosen password until approved
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

RegistrationRequestSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

RegistrationRequestSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; }
});

module.exports = mongoose.model('RegistrationRequest', RegistrationRequestSchema);
