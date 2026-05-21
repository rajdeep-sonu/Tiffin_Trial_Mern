const ProviderProfile = require("../models/ProviderProfile");
const WeeklyMenu = require("../models/WeeklyMenu");
const Coupon = require("../models/Coupon");
const TrialOrder = require("../models/TrialOrder");
const Review = require("../models/Review");
const cloudinary = require("../utils/cloudinary");

// 1️⃣ Create provider profile (only once)
const createProviderProfile = async (req, res) => {
  try {
    const { kitchenName, ownerName, phone, address, city, vegOnly } = req.body;

    // Validation
    if (!kitchenName || !ownerName || !phone || !address || !city) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Check if provider already has a profile
    const existingProfile = await ProviderProfile.findOne({
      userId: req.user._id,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Provider profile already exists.",
      });
    }

    // Create new profile
    const providerProfile = new ProviderProfile({
      userId: req.user._id,
      kitchenName,
      ownerName,
      phone,
      address,
      city,
      vegOnly: vegOnly || false,
    });

    await providerProfile.save();

    res.status(201).json({
      success: true,
      message: "Provider profile created successfully.",
      data: providerProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating provider profile.",
      error: error.message,
    });
  }
};

// 1️⃣ B Update subscription prices
const updateSubscriptionPrices = async (req, res) => {
  try {
    const { prices } = req.body;
    const providerId = req.user._id;

    // Validation
    if (!prices || typeof prices !== "object") {
      return res.status(400).json({
        success: false,
        message: "Please provide prices object with 7days, 30days, 60days, 90days.",
      });
    }

    // Validate all required plan prices are provided
    const requiredPlans = ["7days", "30days", "60days", "90days"];
    for (let plan of requiredPlans) {
      if (!(plan in prices) || typeof prices[plan] !== "number") {
        return res.status(400).json({
          success: false,
          message: `Invalid or missing price for ${plan}. All plans must have numeric prices.`,
        });
      }
      if (prices[plan] <= 0) {
        return res.status(400).json({
          success: false,
          message: `Price for ${plan} must be greater than 0.`,
        });
      }
    }

    // Find and update provider profile
    const providerProfile = await ProviderProfile.findOne({ userId: providerId });

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found. Please create a profile first.",
      });
    }

    // Update prices
    providerProfile.subscriptionPrices = {
      "7days": prices["7days"],
      "30days": prices["30days"],
      "60days": prices["60days"],
      "90days": prices["90days"],
    };

    await providerProfile.save();

    res.status(200).json({
      success: true,
      message: "Subscription prices updated successfully.",
      data: {
        kitchenName: providerProfile.kitchenName,
        subscriptionPrices: providerProfile.subscriptionPrices,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating subscription prices.",
      error: error.message,
    });
  }
};

// 2️⃣ Create weekly food menu
const createWeeklyMenu = async (req, res) => {
  try {
    const { weekStart, weekEnd, menu } = req.body;

    console.log('=== CREATE WEEKLY MENU ===');
    console.log('Body received:', { weekStart: weekStart ? 'YES' : 'NO', weekEnd: weekEnd ? 'YES' : 'NO', menu: menu ? 'YES' : 'NO' });
    console.log('Files count:', req.files ? req.files.length : 0);
    
    if (req.files && req.files.length > 0) {
      console.log('Files received:');
      req.files.forEach((f, idx) => {
        console.log(`  [${idx}] ${f.fieldname} -> ${f.originalname} (${f.size} bytes) at ${f.path}`);
      });
    }

    // Validation
    if (!weekStart || !weekEnd || !menu) {
      return res.status(400).json({
        success: false,
        message: "Please provide weekStart, weekEnd, and menu.",
      });
    }

    // Parse menu if it's a string (comes as JSON string from FormData)
    let menuObject = menu;
    if (typeof menu === "string") {
      try {
        menuObject = JSON.parse(menu);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: "Invalid menu JSON format.",
        });
      }
    }

    // Validate menu object structure
    if (typeof menuObject !== "object" || menuObject === null) {
      return res.status(400).json({
        success: false,
        message: "Menu must be a valid object.",
      });
    }

    // Check if provider profile exists
    const providerProfile = await ProviderProfile.findOne({
      userId: req.user._id,
    });

    if (!providerProfile) {
      return res.status(400).json({
        success: false,
        message: "Please create provider profile first.",
      });
    }

    // Process per-meal images
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    let imagesProcessed = 0;

    console.log('Starting image processing...');

    // Upload images and attach to menu object
    for (const day of days) {
      // Ensure day exists in menuObject
      if (!menuObject[day]) {
        menuObject[day] = { breakfast: '', lunch: '', dinner: '' };
      }

      for (const mealType of mealTypes) {
        const fieldName = `images_${day}_${mealType}`;
        
        // Find file with matching fieldname
        const file = req.files && req.files.find(f => f.fieldname === fieldName);

        if (file) {
          try {
            console.log(`\n[UPLOAD] ${fieldName}`);
            console.log(`  File: ${file.originalname}`);
            console.log(`  Path: ${file.path}`);
            console.log(`  Size: ${file.size} bytes`);
            
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "tiffintrial/menus",
              resource_type: "auto",
            });

            console.log(`  ✅ Cloudinary URL: ${result.secure_url}`);
            console.log(`  ✅ Public ID: ${result.public_id}`);

            // Store image metadata with meal
            menuObject[day][`${mealType}_image`] = {
              url: result.secure_url,
              public_id: result.public_id,
            };
            imagesProcessed++;

            // Delete local file after upload
            const fs = require("fs");
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
              console.log(`  ✅ Local file deleted`);
            }
          } catch (uploadError) {
            console.error(`  ❌ ERROR uploading to Cloudinary:`, uploadError.message);
            return res.status(500).json({
              success: false,
              message: `Error uploading ${day} ${mealType} image to Cloudinary.`,
              error: uploadError.message,
            });
          }
        } else {
          console.log(`[SKIP] ${fieldName} - No file found`);
        }
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total images processed: ${imagesProcessed}`);
    console.log(`Menu object keys:`, Object.keys(menuObject));
    
    // Log menu structure for debugging
    console.log('\nMenu structure:');
    days.forEach(day => {
      const dayMenu = menuObject[day];
      const hasItems = dayMenu.breakfast || dayMenu.lunch || dayMenu.dinner;
      const hasImages = dayMenu.breakfast_image || dayMenu.lunch_image || dayMenu.dinner_image;
      console.log(`  ${day}: items=${hasItems ? 'YES' : 'NO'}, images=${hasImages ? 'YES' : 'NO'}`);
    });

    // Create weekly menu
    const weeklyMenu = new WeeklyMenu({
      providerId: req.user._id,
      weekStart: new Date(weekStart),
      weekEnd: new Date(weekEnd),
      menu: menuObject,
    });

    await weeklyMenu.save();

    console.log('\n✅ Menu saved to MongoDB');
    console.log(`Menu ID: ${weeklyMenu._id}`);

    res.status(201).json({
      success: true,
      message: `Weekly menu created successfully with ${imagesProcessed} images!`,
      data: weeklyMenu,
    });
  } catch (error) {
    console.error('❌ ERROR in createWeeklyMenu:', error.message);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: "Error creating weekly menu.",
      error: error.message,
    });
  }
};

// 2️⃣ B Get provider's menus (for coupon creation)
const getMyMenus = async (req, res) => {
  try {
    const menus = await WeeklyMenu.find({ providerId: req.user._id });

    res.status(200).json({
      success: true,
      message: "Provider menus retrieved successfully.",
      count: menus.length,
      data: menus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving menus.",
      error: error.message,
    });
  }
};

// 3️⃣ Create 7 day trial coupon for a menu
const createCoupon = async (req, res) => {
  try {
    const { menuId, code, discountType, discountValue, validDays, validUntil } = req.body;
    const providerId = req.user._id;

    // Validation
    if (!menuId || !code || !discountType || discountValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide menuId, code, discountType, and discountValue.",
      });
    }

    if (!['percent', 'flat'].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: "discountType must be either 'percent' or 'flat'.",
      });
    }

    if (discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "discountValue must be greater than 0.",
      });
    }

    // Parse validDays (default 7)
    const days = validDays ? parseInt(validDays) : 7;
    
    // Determine validUntil date
    let validUntilDate;
    if (validUntil) {
      validUntilDate = new Date(validUntil);
    } else {
      validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + days);
    }

    // Validate validUntil is in future
    if (validUntilDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Valid Until date must be in the future.",
      });
    }

    // Calculate expiry date
    let expiryDate = validUntilDate;

    // Check if provider has created at least one weekly menu
    const existingMenu = await WeeklyMenu.findOne({ providerId });
    if (!existingMenu) {
      return res.status(403).json({
        success: false,
        message: "You must create a weekly menu before creating a coupon.",
      });
    }

    // Check if menu exists and belongs to provider
    const weeklyMenu = await WeeklyMenu.findById(menuId);
    if (!weeklyMenu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found.",
      });
    }

    if (weeklyMenu.providerId.toString() !== providerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. This menu does not belong to you.",
      });
    }

    // Normalize code to uppercase and trim
    const normalizedCode = code.toUpperCase().trim();

    // Check if coupon code already exists for this provider
    const existingCoupon = await Coupon.findOne({
      providerId: providerId,
      code: normalizedCode,
    });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists for your account.",
      });
    }

    // Create coupon with discount details
    const coupon = new Coupon({
      providerId: providerId,
      menuId: menuId,
      code: normalizedCode,
      discountType: discountType,
      discountValue: parseFloat(discountValue),
      validFrom: new Date(),
      validUntil: validUntilDate,
      expiryDate: expiryDate,
      validDays: days,
      trialOnly: true,
      isActive: true,
    });

    await coupon.save();

    // Update WeeklyMenu with trial coupon ID if not already set
    if (!weeklyMenu.trialCouponId) {
      weeklyMenu.trialCouponId = coupon._id;
      await weeklyMenu.save();
    }

    res.status(201).json({
      success: true,
      message: "Trial coupon created successfully.",
      data: coupon,
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      success: false,
      message: "Error creating coupon.",
      error: error.message,
    });
  }
};

// 4️⃣ View all trial users for this provider
const getMyTrials = async (req, res) => {
  try {
    // Get all trial orders for this provider with student details
    const trials = await TrialOrder.find({ providerId: req.user._id })
      .populate("studentId", "name email")
      .populate("menuId", "weekStart weekEnd")
      .sort({ createdAt: -1 });

    // Transform data to extract student name and email
    const formattedTrials = trials.map((trial) => ({
      _id: trial._id,
      studentId: trial.studentId?._id,
      studentName: trial.studentId?.name || "Student",
      studentEmail: trial.studentId?.email || "",
      providerId: trial.providerId,
      menuId: trial.menuId?._id,
      kitchenName: trial.kitchenName,
      startDate: trial.startDate,
      endDate: trial.endDate,
      status: trial.status,
      couponCode: trial.couponCode,
      createdAt: trial.createdAt,
      updatedAt: trial.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Trial orders retrieved successfully.",
      count: formattedTrials.length,
      data: formattedTrials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching trial orders.",
      error: error.message,
    });
  }
};

// 5️⃣ View all reviews for this provider
const getMyReviews = async (req, res) => {
  try {
    // Get all reviews for this provider with full student details
    const reviews = await Review.find({ providerId: req.user._id })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully.",
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reviews.",
      error: error.message,
    });
  }
};

// 5️⃣ B View all subscriptions for this provider
const getProviderSubscriptions = async (req, res) => {
  try {
    const Subscription = require("../models/Subscription");
    // Convert ObjectId to string for proper comparison
    const providerId = req.user._id.toString();

    console.log(`\n[DEBUG] ========== GET PROVIDER SUBSCRIPTIONS ==========`);
    console.log(`[DEBUG] Current user (req.user):`, req.user);
    console.log(`[DEBUG] Provider ID (converted to string): ${providerId}`);
    console.log(`[DEBUG] Provider ID type: ${typeof providerId}`);

    // Get all subscriptions for this provider with student details
    const subscriptions = await Subscription.find({ providerId: providerId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[DEBUG] ✅ Query completed`);
    console.log(`[DEBUG] Found ${subscriptions.length} subscriptions for provider ${providerId}`);
    
    if (subscriptions.length > 0) {
      console.log(`[DEBUG] Subscription details:`);
      subscriptions.forEach((sub, index) => {
        console.log(`[DEBUG]   [${index}] studentName: ${sub.studentName}, studentEmail: ${sub.studentEmail}, providerId: ${sub.providerId}`);
      });
    } else {
      console.log(`[DEBUG] ⚠️ NO SUBSCRIPTIONS found for this provider!`);
      console.log(`[DEBUG] Checking database for ANY subscriptions...`);
      
      // Debug: Show all subscriptions in database
      const allSubscriptions = await Subscription.find({}).lean();
      console.log(`[DEBUG] Total subscriptions in database: ${allSubscriptions.length}`);
      
      if (allSubscriptions.length > 0) {
        console.log(`[DEBUG] All subscriptions with their provider IDs:`);
        allSubscriptions.forEach((sub, index) => {
          console.log(`[DEBUG]   [${index}] providerId: ${sub.providerId}, studentName: ${sub.studentName}, kitchenName: ${sub.kitchenName}`);
        });
      }
    }

    console.log(`[DEBUG] ========== END GET PROVIDER SUBSCRIPTIONS ==========\n`);

    res.status(200).json({
      success: true,
      message: "Subscriptions retrieved successfully.",
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    console.error(`[ERROR] getProviderSubscriptions:`, error.message);
    console.error(`[ERROR] Full error:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching subscriptions.",
      error: error.message,
    });
  }
};

// 6️⃣ DEBUG: Get all provider data for troubleshooting
const getProviderDebugData = async (req, res) => {
  try {
    const providerId = req.user._id;

    // Get menus
    const menus = await WeeklyMenu.find({ providerId: providerId }).lean();

    // Get coupons
    const coupons = await Coupon.find({ providerId: providerId }).lean();

    // Get trials
    const trials = await TrialOrder.find({ providerId: providerId }).lean();

    // Get provider profile
    const providerProfile = await ProviderProfile.findOne({
      userId: providerId,
    }).lean();

    res.status(200).json({
      success: true,
      message: "Provider debug data retrieved successfully.",
      data: {
        provider: {
          userId: providerId,
          profile: providerProfile,
        },
        menus: {
          count: menus.length,
          data: menus,
        },
        coupons: {
          count: coupons.length,
          data: coupons,
        },
        trials: {
          count: trials.length,
          data: trials,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching debug data.",
      error: error.message,
    });
  }
};

// 7️⃣ SIMPLE DEBUG: Get provider ID and menus count
const getMenusDebugSimple = async (req, res) => {
  try {
    const providerId = req.user._id;
    const menus = await WeeklyMenu.find({ providerId: providerId }).count();

    res.status(200).json({
      success: true,
      providerId: providerId,
      menusCount: menus,
      message: menus > 0 ? "Menus found" : "No menus found",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching menus debug info.",
      error: error.message,
    });
  }
};

// 8️⃣ Delete a trial application
const deleteProviderTrial = async (req, res) => {
  try {
    const { trialId } = req.params;
    const providerId = req.user._id;

    // Find the trial
    const trial = await TrialOrder.findById(trialId);

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: "Trial not found.",
      });
    }

    // Make sure the trial belongs to this provider
    if (trial.providerId.toString() !== providerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this trial.",
      });
    }

    // Delete the trial
    await TrialOrder.findByIdAndDelete(trialId);

    res.status(200).json({
      success: true,
      message: "Trial deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting trial.",
      error: error.message,
    });
  }
};

// 9️⃣ Delete a subscription
const deleteProviderSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const providerId = req.user._id;

    const Subscription = require("../models/Subscription");

    // Find the subscription
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    // Make sure the subscription belongs to this provider
    if (subscription.providerId.toString() !== providerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this subscription.",
      });
    }

    // Delete the subscription
    await Subscription.findByIdAndDelete(subscriptionId);

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting subscription.",
      error: error.message,
    });
  }
};

// 1️⃣0️⃣ Get business analytics for provider
const getProviderAnalytics = async (req, res) => {
  try {
    const providerId = req.user._id;
    const Subscription = require("../models/Subscription");
    const TrialOrder = require("../models/TrialOrder");
    const Review = require("../models/Review");

    // Fetch all subscriptions for total revenue calculation
    const subscriptions = await Subscription.find({ providerId });
    const totalRevenue = subscriptions.reduce((acc, sub) => acc + (sub.finalPrice || sub.price || 0), 0);

    // Active subscriptions (currently active and not paused)
    const activeSubscriptionsCount = await Subscription.countDocuments({
      providerId,
      active: true,
      status: "active",
    });

    // Paused subscriptions
    const pausedSubscriptionsCount = await Subscription.countDocuments({
      providerId,
      active: true,
      status: "paused",
    });

    // Total subscribers ever
    const totalSubscribersCount = subscriptions.length;

    // Active Trials
    const activeTrialsCount = await TrialOrder.countDocuments({
      providerId,
      status: "active",
    });

    // Total Trials
    const totalTrialsCount = await TrialOrder.countDocuments({
      providerId,
    });

    // Reviews and Ratings
    const reviews = await Review.find({ providerId });
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round((reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews) * 10) / 10
        : 0;

    // Breakdown of subscriptions by plan duration
    const planBreakdown = {
      "7days": 0,
      "30days": 0,
      "60days": 0,
      "90days": 0,
    };
    subscriptions.forEach((sub) => {
      if (planBreakdown[sub.plan] !== undefined) {
        planBreakdown[sub.plan]++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        activeSubscriptionsCount,
        pausedSubscriptionsCount,
        totalSubscribersCount,
        activeTrialsCount,
        totalTrialsCount,
        totalReviews,
        averageRating,
        planBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching provider analytics.",
      error: error.message,
    });
  }
};

// 1️⃣1️⃣ Get daily delivery roster
const getProviderDailyDeliveries = async (req, res) => {
  try {
    const providerId = req.user._id;
    const Subscription = require("../models/Subscription");
    const DeliveryLog = require("../models/DeliveryLog");

    // Get today's date normalized to UTC midnight
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 1. Fetch active subscriptions (active: true, status: "active")
    const activeSubscriptions = await Subscription.find({
      providerId,
      active: true,
      status: "active",
    });

    // 2. Ensure each active subscription has a DeliveryLog for today
    for (const sub of activeSubscriptions) {
      // Find if today's log already exists for this subscription
      const existingLog = await DeliveryLog.findOne({
        subscriptionId: sub._id,
        date: today,
      });

      if (!existingLog) {
        try {
          await DeliveryLog.create({
            subscriptionId: sub._id,
            studentId: sub.studentId,
            providerId: providerId,
            date: today,
            status: "pending",
          });
        } catch (err) {
          // If duplicate key due to race condition, ignore
          if (err.code !== 11000) {
            console.error("Error creating delivery log:", err);
          }
        }
      }
    }

    // 3. Query all today's logs for this provider, populating student details
    const logs = await DeliveryLog.find({
      providerId,
      date: today,
    })
      .populate("studentId", "name email")
      .populate("subscriptionId", "plan kitchenName status")
      .lean();

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching daily deliveries.",
      error: error.message,
    });
  }
};

// 1️⃣2️⃣ Update status of a specific delivery log
const updateDeliveryStatus = async (req, res) => {
  try {
    const { logId } = req.params;
    const { status, notes } = req.body;
    const providerId = req.user._id;
    const DeliveryLog = require("../models/DeliveryLog");

    // Validate status
    const validStatuses = ["pending", "dispatched", "delivered", "skipped"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    // Find the log
    const log = await DeliveryLog.findById(logId);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Delivery log not found.",
      });
    }

    // Check ownership
    if (log.providerId.toString() !== providerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this delivery log.",
      });
    }

    // Update
    if (status) log.status = status;
    if (notes !== undefined) log.notes = notes;

    await log.save();

    res.status(200).json({
      success: true,
      message: "Delivery status updated successfully.",
      data: log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating delivery status.",
      error: error.message,
    });
  }
};

module.exports = {
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
};
