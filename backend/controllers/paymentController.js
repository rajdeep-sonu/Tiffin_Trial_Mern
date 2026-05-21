const Payment = require("../models/Payment");
const User = require("../models/User");
const TrialOrder = require("../models/TrialOrder");

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

// SIMPLE PAYMENT - Click Pay & Done!
exports.processPayment = async (req, res) => {
  try {
    const { planType, providerId } = req.body;
    const studentId = req.user?.id;

    console.log(`[PAYMENT] Processing - Plan: ${planType}, Student: ${studentId}, Provider: ${providerId}`);

    // Validate
    if (!studentId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!planType || !PLANS[planType]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const plan = PLANS[planType];

    // Create payment record
    const payment = new Payment({
      userId: studentId,
      amount: plan.amount,
      planType: planType,
      transactionId: `mock_${Date.now()}`,
    });
    await payment.save();
    console.log(`[PAYMENT] Payment saved: ${payment._id}`);

    // Calculate trial dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    // Create trial order
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
    console.log(`[PAYMENT] Trial saved: ${trialOrder._id}`);

    // Return success
    res.json({
      success: true,
      message: "Payment successful! Trial activated.",
      trialId: trialOrder._id,
    });
  } catch (error) {
    console.error("[PAYMENT] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const studentId = req.user._id;
    const payments = await Payment.find({ userId: studentId }).sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};

// Get Subscription Status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const studentId = req.user._id;
    const user = await User.findById(studentId);

    const now = new Date();
    const isSubscriptionActive =
      user.subscriptionStatus === "active" && now < new Date(user.subscriptionEndDate);

    res.json({
      success: true,
      isSubscriptionActive,
      isPaymentRequired: !isSubscriptionActive,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed" });
  }
};
