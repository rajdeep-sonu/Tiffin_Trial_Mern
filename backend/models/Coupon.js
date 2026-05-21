const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    // Discount coupon fields
    discountType: {
      type: String,
      enum: ["percent", "flat"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    // Trial coupon fields (optional for backward compatibility)
    menuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklyMenu",
      default: null,
    },
    trialOnly: {
      type: Boolean,
      default: false,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    validDays: {
      type: Number,
      default: 7,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure code is unique per provider
couponSchema.index({ providerId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model("Coupon", couponSchema);
