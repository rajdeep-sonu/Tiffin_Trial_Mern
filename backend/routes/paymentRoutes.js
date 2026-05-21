const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  processPayment,
  getPaymentHistory,
} = require("../controllers/paymentController");

const router = express.Router();

// Process Direct Payment - Creates trial immediately
router.post("/process", protect, processPayment);

// Get payment history
router.get("/history", protect, getPaymentHistory);

// Get payment history
router.get("/history", protect, getPaymentHistory);

module.exports = router;
