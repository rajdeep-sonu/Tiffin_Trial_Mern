const mongoose = require("mongoose");

const weeklyMenuSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weekStart: {
      type: Date,
      required: true,
    },
    weekEnd: {
      type: Date,
      required: true,
    },
    menu: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    trialCouponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeeklyMenu", weeklyMenuSchema);
