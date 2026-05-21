const mongoose = require("mongoose");

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    kitchenName: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    vegOnly: {
      type: Boolean,
      default: false,
    },
    subscriptionPrices: {
      type: {
        "7days": { type: Number, default: 150 },
        "30days": { type: Number, default: 500 },
        "60days": { type: Number, default: 900 },
        "90days": { type: Number, default: 1200 },
      },
      default: {
        "7days": 150,
        "30days": 500,
        "60days": 900,
        "90days": 1200,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProviderProfile", providerProfileSchema);
