const express = require("express");
const router = express.Router();
const {
  createProviderProfile,
  updateSubscriptionPrices,
  createWeeklyMenu,
  getMyMenus,
  createCoupon,
  getMyTrials,
  getMyReviews,
  getProviderSubscriptions,
  getProviderDebugData,
  getMenusDebugSimple,
  deleteProviderTrial,
  deleteProviderSubscription,
  getProviderAnalytics,
  getProviderDailyDeliveries,
  updateDeliveryStatus,
} = require("../controllers/providerController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const upload = require("../utils/multerConfig");

// Helper middleware
const providerAuth = [protect, authorizeRoles("provider")];

// Middleware to parse multipart form fields (menu, dates) after multer processes files
const parseMultipartFields = (req, res, next) => {
  console.log('[ROUTE] /menu request received');
  console.log('[ROUTE] Method:', req.method);
  console.log('[ROUTE] Content-Type:', req.get('content-type'));
  console.log('[ROUTE] Files:', req.files ? req.files.length : 0);
  
  if (req.files && req.files.length > 0) {
    console.log('[ROUTE] Files received:');
    req.files.forEach((f, idx) => {
      console.log(`  [${idx}] ${f.fieldname}`);
    });
  }
  
  // Body fields from multipart are in req.body
  console.log('[ROUTE] Body fields:', Object.keys(req.body));
  next();
};

// 1️⃣ Create provider profile
router.post("/profile", providerAuth, createProviderProfile);

// 1️⃣ B Update subscription prices
router.post("/subscription-prices", providerAuth, updateSubscriptionPrices);

// 2️⃣ Create weekly menu with image uploads
router.post("/menu", 
  protect, 
  authorizeRoles("provider"), 
  upload.any(),
  parseMultipartFields,
  createWeeklyMenu
);

// 2️⃣ B Get my menus (for coupon creation)
router.get("/menus", providerAuth, getMyMenus);

// 3️⃣ Create trial coupon
router.post("/coupon", providerAuth, createCoupon);

// 4️⃣ Get all trial orders
router.get("/trials", providerAuth, getMyTrials);

// 4️⃣ B Delete a trial application
router.delete("/trial/:trialId", providerAuth, deleteProviderTrial);

// 5️⃣ Get all reviews
router.get("/reviews", providerAuth, getMyReviews);

// 5️⃣ B Get all subscriptions
router.get("/subscriptions", providerAuth, getProviderSubscriptions);

// 5️⃣ C Delete a subscription
router.delete("/subscriptions/:subscriptionId", providerAuth, deleteProviderSubscription);

// 8️⃣ Get provider analytics
router.get("/analytics", providerAuth, getProviderAnalytics);

// 9️⃣ Get daily delivery roster
router.get("/deliveries/today", providerAuth, getProviderDailyDeliveries);

// 🔟 Update specific delivery log status
router.patch("/deliveries/:logId/status", providerAuth, updateDeliveryStatus);

// DEBUG: Show current provider info
router.get("/debug/whoami", providerAuth, (req, res) => {
  res.json({
    success: true,
    message: "Current provider info",
    provider: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    }
  });
});

// 6️⃣ DEBUG: Get all provider data
router.get("/debug/mydata", providerAuth, getProviderDebugData);

// 7️⃣ DEBUG: Simple menus debug (provider ID + count)
router.get("/my-menus-debug", providerAuth, getMenusDebugSimple);

module.exports = router;
