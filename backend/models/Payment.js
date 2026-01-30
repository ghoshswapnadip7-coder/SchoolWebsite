const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["COMPLETED", "FAILED", "PENDING"],
    default: "COMPLETED",
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  semester: {
    type: String, // e.g. "Final Term 2025"
  },
  paymentMethod: {
    type: String,
    enum: ["CASH", "UPI"],
    default: "UPI",
  },
});

// Ensure virtuals are serialized
PaymentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
