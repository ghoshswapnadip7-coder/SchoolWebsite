const mongoose = require('mongoose');

const RoomSettingsSchema = new mongoose.Schema({
  room: { type: String, required: true, unique: true }, // e.g., "Class-10"
  isDisabled: { type: Boolean, default: false },
  mutedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('RoomSettings', RoomSettingsSchema);
