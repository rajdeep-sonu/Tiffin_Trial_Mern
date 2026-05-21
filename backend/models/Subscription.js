const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
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
    plan: {
      type: String,
      enum: ["7days", "30days", "60days", "90days"],
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
    price: {
      type: Number,
      required: true,
    },
    // Student details (cached for display)
    studentName: {
      type: String,
      default: "Student",
    },
    studentEmail: {
      type: String,
      default: "",
    },
    // Provider details (cached for display)
    kitchenName: {
      type: String,
      default: "Kitchen",
    },
    city: {
      type: String,
      default: "Location",
    },
    // Coupon fields
    couponCode: {
      type: String,
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "paused"],
      default: "active",
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    accumulatedPausedTime: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
