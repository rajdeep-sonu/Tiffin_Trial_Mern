const mongoose = require("mongoose");

const trialOrderSchema = new mongoose.Schema(
  {
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
    menuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklyMenu",
      required: true,
    },
    kitchenName: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound unique index on studentId and providerId
trialOrderSchema.index({ studentId: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.model("TrialOrder", trialOrderSchema);
