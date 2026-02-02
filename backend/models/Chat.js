const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  room: { type: String, required: true, index: true }, // e.g., "Class-10", "Teachers"
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String }, // Cache name to avoid heavy populates if user deleted
  senderRole: { type: String, enum: ['STUDENT', 'TEACHER', 'ADMIN'], default: 'STUDENT' }, 
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isPinned: { type: Boolean, default: false },
  
  // Moderation Fields
  isFlagged: { type: Boolean, default: false },
  violationReason: { type: String }, // 'profanity', 'manual'
  mentions: [{ type: String }], // Array of usernames mentioned (@User)
  
  isDeleted: { type: Boolean, default: false },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Who deleted it
});

module.exports = mongoose.model('Chat', ChatSchema);
