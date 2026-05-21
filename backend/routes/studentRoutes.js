const express = require("express");
const router = express.Router();
const {
  getProviders,
  getProviderSubscriptionPrices,
  getProviderMenus,
  getProviderCoupons,
  getStudentTrials,
  applyTrial,
  submitReview,
  createSubscription,
  getStudentSubscriptions,
  updateOldSubscriptions,
  deleteSubscription,
  deleteStudentTrial,
  pauseSubscription,
  resumeSubscription,
  getStudentDeliveryLogs,
} = require("../controllers/studentController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

// All routes are protected and role-based authorized for "student"
// Apply protect and authorizeRoles to all routes
router.use(protect, authorizeRoles("student"));

// 1️⃣ Browse providers with filters
router.get("/providers", getProviders);

// 1️⃣ B Get provider subscription prices
router.get("/provider/:providerId/prices", getProviderSubscriptionPrices);

// 2️⃣ View provider weekly menus
router.get("/provider-menu/:id", getProviderMenus);

// 2️⃣ B Get available coupons for a provider
router.get("/provider-coupons/:providerId", getProviderCoupons);

// 2️⃣ C Get all student trials
router.get("/trials", getStudentTrials);

// 2️⃣ D Delete a trial
router.delete("/trials/:trialId", deleteStudentTrial);

// 3️⃣ Apply for 7-day trial using coupon
router.post("/trial/apply", applyTrial);

// 4️⃣ Submit review after trial
router.post("/review", submitReview);

// 5️⃣ Create monthly subscription
router.post("/subscribe", createSubscription);

// 5️⃣ B Get student's subscriptions
router.get("/subscriptions/active", getStudentSubscriptions);

// 5️⃣ C Update old subscriptions with correct kitchen names
router.post("/subscriptions/update-old", updateOldSubscriptions);

// 5️⃣ D Delete a subscription
router.delete("/subscriptions/:subscriptionId", deleteSubscription);

// 5️⃣ E Pause subscription
router.post("/subscriptions/:subscriptionId/pause", pauseSubscription);

// 5️⃣ F Resume subscription
router.post("/subscriptions/:subscriptionId/resume", resumeSubscription);

// 6️⃣ Get delivery logs history
router.get("/deliveries/history", getStudentDeliveryLogs);

module.exports = router;
