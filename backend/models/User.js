const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address.",
      ],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "provider"],
      required: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    subscriptionEndDate: {
      type: Date,
      default: null,
    },
    lastPaymentDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
