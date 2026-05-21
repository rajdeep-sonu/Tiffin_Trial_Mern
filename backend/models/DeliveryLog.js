const mongoose = require("mongoose");

const deliveryLogSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "dispatched", "delivered", "skipped"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate logs for the same subscription on the same calendar day
deliveryLogSchema.index({ subscriptionId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DeliveryLog", deliveryLogSchema);
