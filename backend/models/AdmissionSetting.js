const mongoose = require("mongoose");

const AdmissionSettingSchema = new mongoose.Schema({
  isOpen: {
    type: Boolean,
    default: false,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  allowedClasses: {
    type: [String],
    default: [],
  },
  classFees: {
    type: Map,
    of: Number,
    default: {},
  },
  subjectFees: {
    type: Map,
    of: Number,
    default: {},
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AdmissionSetting", AdmissionSettingSchema);
