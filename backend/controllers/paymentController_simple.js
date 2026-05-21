const Payment = require("../models/Payment");
const User = require("../models/User");
const TrialOrder = require("../models/TrialOrder");
const WeeklyMenu = require("../models/WeeklyMenu");

// Pricing plans
const PLANS = {
  "1week": {
    amount: 9.99,
    durationDays: 7,
    displayText: "7 Days - $9.99",
  },
  "1month": {
    amount: 39.99,
    durationDays: 30,
    displayText: "30 Days - $39.99",
  },
};

// SIMPLE PAYMENT - No Stripe API, Direct Mock Payment
exports.processPayment = async (req, res) => {
  try {
    const { planType, providerId } = req.body;
    const studentId = req.user?.id;

    console.log(`[PAYMENT] Processing payment - Plan: ${planType}, Student: ${studentId}, Provider: ${providerId}`);

    // Validate inputs
    if (!studentId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!planType || !PLANS[planType]) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    // Get user
    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const plan = PLANS[planType];

    // Create Payment record (mock payment)
    const payment = new Payment({
      userId: studentId,
      amount: plan.amount,
      planType: planType,
      status: "completed",
      transactionId: `mock_${Date.now()}`,
      description: `TiffinTrial ${plan.displayText}`,
    });
    await payment.save();
    console.log(`[PAYMENT] ✅ Payment created: ${payment._id}`);

    // Calculate trial dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    // Create Trial Order
    const trialOrder = new TrialOrder({
      studentId: studentId,
      providerId: providerId,
      paymentId: payment._id,
      planType: planType,
      startDate: startDate,
      endDate: endDate,
      status: "active",
      durationDays: plan.durationDays,
    });
    await trialOrder.save();
    console.log(`[PAYMENT] ✅ Trial created: ${trialOrder._id}`);

    // Update user subscription
    user.subscription = {
      planType: planType,
      startDate: startDate,
      endDate: endDate,
      status: "active",
    };
    await user.save();
    console.log(`[PAYMENT] ✅ User subscription updated`);

    // Return success
    res.json({
      success: true,
      message: "Payment successful! Trial activated.",
      trialId: trialOrder._id,
      trial: trialOrder,
    });
  } catch (error) {
    console.error("[PAYMENT] Error:", error.message);
    res.status(500).json({ error: error.message || "Payment processing failed" });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    res.json({ data: payments });
  } catch (error) {
    console.error("[PAYMENT] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
