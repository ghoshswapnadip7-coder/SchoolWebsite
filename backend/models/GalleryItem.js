const mongoose = require('mongoose');

const GalleryItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

GalleryItemSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

GalleryItemSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; }
});

module.exports = mongoose.model('GalleryItem', GalleryItemSchema);
