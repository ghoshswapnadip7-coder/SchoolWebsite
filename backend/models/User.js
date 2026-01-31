const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true, // Only for students
  },
  class: {
    type: String, // e.g. "Class-10"
    required: false,
  },
  rollNumber: {
    type: String,
    required: false,
  },
  stream: {
    type: String,
    required: false,
  },
  subjects: {
    type: [String],
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["STUDENT", "TEACHER", "ADMIN"],
    default: "STUDENT",
  },
  feesAmount: {
    type: Number,
    default: 0
  },
  feesDueDate: {
    type: Date
  },
  isFeesPaid: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  profilePic: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  },
  blockReason: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for id to match Prisma's output if needed
UserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtuals are serialized
UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

module.exports = mongoose.model("User", UserSchema);
