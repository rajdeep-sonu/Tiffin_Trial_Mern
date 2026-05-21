const ProviderProfile = require("../models/ProviderProfile");
const WeeklyMenu = require("../models/WeeklyMenu");
const Coupon = require("../models/Coupon");
const TrialOrder = require("../models/TrialOrder");
const Review = require("../models/Review");
const Subscription = require("../models/Subscription");

// 1️⃣ Browse providers
const getProviders = async (req, res) => {
  try {
    const { city, vegOnly } = req.query;

    // Build filter object
    let filter = {};

    if (city) {
      // Escape regex special characters to prevent NoSQL injection and ReDoS
      const escapedCity = city.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      filter.city = { $regex: escapedCity, $options: "i" };
    }

    if (vegOnly === "true" || vegOnly === true) {
      filter.vegOnly = true;
    }

    // Get providers with pagination options
    const providers = await ProviderProfile.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Programmatically aggregate average rating and review counts
    const Review = require("../models/Review");
    const providersWithRatings = await Promise.all(
      providers.map(async (provider) => {
        const providerUserId = provider.userId?._id;
        let reviewCount = 0;
        let averageRating = 0;

        if (providerUserId) {
          const reviews = await Review.find({ providerId: providerUserId });
          reviewCount = reviews.length;
          averageRating =
            reviewCount > 0
              ? Math.round((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount) * 10) / 10
              : 0;
        }

        return {
          ...provider,
          averageRating,
          reviewCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Providers retrieved successfully.",
      count: providersWithRatings.length,
      data: providersWithRatings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching providers.",
      error: error.message,
    });
  }
};

// 1️⃣ B Get provider subscription prices
const getProviderSubscriptionPrices = async (req, res) => {
  try {
    const { providerId } = req.params;

    // Get provider profile with subscription prices by ProviderProfile ID
    const provider = await ProviderProfile.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Provider subscription prices retrieved successfully.",
      kitchenName: provider.kitchenName,
      prices: provider.subscriptionPrices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching provider subscription prices.",
      error: error.message,
    });
  }
};

// 2️⃣ View provider weekly menus
const getProviderMenus = async (req, res) => {
  try {
    const { id } = req.params;

    // Get provider profile first
    const provider = await ProviderProfile.findOne({ userId: id });
    
    if (!provider) {
      return res.status(404).json({
        success: true,
        message: "Provider not found.",
        count: 0,
        data: [],
      });
    }

    // Get all menus for this provider - don't use .select() to ensure all nested data is returned
    const menus = await WeeklyMenu.find({ providerId: id })
      .sort({ weekStart: -1 });

    if (menus.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No menus found for this provider.",
        count: 0,
        data: [],
      });
    }

    // Attach provider data to the menus
    const menusWithProvider = menus.map(menu => ({
      _id: menu._id,
      providerId: menu.providerId,
      weekStart: menu.weekStart,
      weekEnd: menu.weekEnd,
      menu: menu.menu, // This has all nested image data
      images: menu.images,
      trialCouponId: menu.trialCouponId,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
      providerProfile: provider,
    }));

    res.status(200).json({
      success: true,
      message: "Provider menus retrieved successfully.",
      count: menus.length,
      data: menusWithProvider,
      provider: provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching provider menus.",
      error: error.message,
    });
  }
};

// 2️⃣ B Get available coupons for a provider
const getProviderCoupons = async (req, res) => {
  try {
    const { providerId } = req.params;

    // Get active coupons for this provider
    const now = new Date();
    const coupons = await Coupon.find({
      providerId: providerId,
      isActive: true,
      expiryDate: { $gte: now }, // Only unexpired coupons
    })
      .select({ code: 1, discountType: 1, discountValue: 1, expiryDate: 1, validDays: 1, trialOnly: 1 })
      .lean()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Provider coupons retrieved successfully.",
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching provider coupons.",
      error: error.message,
    });
  }
};

// 2️⃣ C Get all student trials
const getStudentTrials = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get all trials for this student (kitchenName is cached in trial document)
    const trials = await TrialOrder.find({ studentId: studentId })
      .populate({
        path: "menuId",
        select: "menu images weekStart weekEnd",
        model: "WeeklyMenu",
      })
      .sort({ startDate: -1 });

    // Transform data for frontend
    const formattedTrials = trials.map((trial) => ({
      _id: trial._id,
      studentId: trial.studentId,
      providerId: trial.providerId,
      provider: {
        kitchenName: trial.kitchenName, // ✅ USE CACHED KITCHEN NAME
      },
      menuId: trial.menuId?._id,
      menu: trial.menuId?.menu,
      images: trial.menuId?.images,
      startDate: trial.startDate,
      endDate: trial.endDate,
      status: trial.status,
      couponCode: trial.couponCode,
      createdAt: trial.createdAt,
      updatedAt: trial.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Student trials retrieved successfully.",
      trials: formattedTrials,
      count: formattedTrials.length,
      data: formattedTrials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching student trials.",
      error: error.message,
    });
  }
};

// 3️⃣ Apply for 7-day trial using coupon
const applyTrial = async (req, res) => {
  try {
    const { providerId, menuId, couponCode, planDuration } = req.body;
    const studentId = req.user._id;

    console.log(`\n[DEBUG] ========== APPLY TRIAL ==========`);
    console.log(`[DEBUG] Received providerId:`, providerId);
    console.log(`[DEBUG] Received menuId:`, menuId);
    console.log(`[DEBUG] Received planDuration:`, planDuration);
    console.log(`[DEBUG] Student ID:`, studentId);

    // Validation - couponCode is OPTIONAL
    if (!providerId || !menuId) {
      return res.status(400).json({
        success: false,
        message: "Please provide providerId and menuId.",
      });
    }

    // 🔥 CRITICAL FIX: Check if providerId is a ProviderProfile ID (wrong) or User ID (correct)
    console.log(`[DEBUG] Checking if providerId is valid...`);
    let actualProviderId = providerId;
    
    const User = require("../models/User");
    const providerUser = await User.findById(providerId);
    
    if (!providerUser) {
      // Maybe it's a ProviderProfile ID, not a User ID
      console.log(`[DEBUG] ⚠️ No user found with ID ${providerId}, trying as ProviderProfile ID...`);
      
      const providerProfile = await ProviderProfile.findById(providerId);
      if (providerProfile && providerProfile.userId) {
        actualProviderId = providerProfile.userId;
        console.log(`[DEBUG] ✅ Found ProviderProfile! Converting ID from ${providerId} to User ID ${actualProviderId}`);
      } else {
        console.log(`[DEBUG] ❌ ID is neither a User ID nor a valid ProviderProfile ID!`);
        return res.status(404).json({
          success: false,
          message: "Provider not found. Please select a valid provider.",
        });
      }
    } else {
      console.log(`[DEBUG] ✅ providerId is a valid User ID`);
    }

    // Check if provider exists
    const provider = await ProviderProfile.findOne({ userId: actualProviderId });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found.",
      });
    }

    // Check if menu exists and belongs to provider
    const menu = await WeeklyMenu.findById(menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found.",
      });
    }

    if (menu.providerId.toString() !== actualProviderId) {
      return res.status(403).json({
        success: false,
        message: "Menu does not belong to this provider.",
      });
    }

    // CRITICAL BUSINESS RULE:
    // Check if student already has ANY trial with this provider (regardless of status)
    const existingTrial = await TrialOrder.findOne({
      studentId: studentId,
      providerId: actualProviderId,
    });

    if (existingTrial) {
      return res.status(409).json({
        success: false,
        message: "You can apply for only one trial per provider.",
      });
    }

    // Handle coupon if provided
    let trialDuration = planDuration || 7; // Use planDuration from frontend, default to 7
    let appliedCouponCode = null;

    console.log(`[DEBUG] Initial trial duration from plan:`, trialDuration);

    if (couponCode) {
      // Check if coupon exists and belongs to provider
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        providerId: actualProviderId,
      });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found or does not belong to this provider.",
        });
      }

      // Check if coupon is active
      if (!coupon.isActive) {
        return res.status(400).json({
          success: false,
          message: "This coupon is no longer active.",
        });
      }

      // Check if coupon is within expiry date
      const now = new Date();
      if (coupon.expiryDate && now > coupon.expiryDate) {
        return res.status(400).json({
          success: false,
          message: "This coupon has expired.",
        });
      }

      // Check if coupon is valid (within validFrom and validUntil dates)
      if (coupon.validFrom && now < coupon.validFrom) {
        return res.status(400).json({
          success: false,
          message: "This coupon is not yet valid.",
        });
      }

      if (coupon.validUntil && now > coupon.validUntil) {
        return res.status(400).json({
          success: false,
          message: "This coupon has expired.",
        });
      }

      // Check if coupon is trial coupon
      if (!coupon.trialOnly) {
        return res.status(400).json({
          success: false,
          message: "This coupon is not for trial access. Use it during subscription.",
        });
      }

      // Store coupon code
      appliedCouponCode = couponCode.toUpperCase().trim();
      console.log(`[DEBUG] Coupon applied: ${appliedCouponCode}`);
    }

    // Create trial order
    const now_time = new Date();
    const endDate = new Date(now_time.getTime() + trialDuration * 24 * 60 * 60 * 1000);

    const trialOrder = new TrialOrder({
      studentId: studentId,
      providerId: actualProviderId,
      menuId: menuId,
      kitchenName: provider.kitchenName, // ✅ CACHE KITCHEN NAME
      startDate: now_time,
      endDate: endDate,
      status: "active",
      couponCode: appliedCouponCode, // Will be null if no coupon provided
    });

    console.log(`[DEBUG] ABOUT TO SAVE trial order with:`);
    console.log(`[DEBUG]   - studentId: ${studentId}`);
    console.log(`[DEBUG]   - providerId: ${actualProviderId} (was ${providerId}, converted: ${actualProviderId !== providerId})`);
    console.log(`[DEBUG]   - kitchenName: ${provider.kitchenName}`);
    console.log(`[DEBUG]   - trialDuration: ${trialDuration}`);

    await trialOrder.save();

    console.log(`[DEBUG] ✅ TRIAL ORDER SAVED`);
    console.log(`[DEBUG] Saved trial _id: ${trialOrder._id}`);
    console.log(`[DEBUG] Saved with providerId: ${trialOrder.providerId}`);
    console.log(`[DEBUG] ========== END APPLY TRIAL ==========\n`);

    const message = appliedCouponCode
      ? `Trial applied successfully! Enjoy ${trialDuration} days of trial with coupon ${appliedCouponCode}.`
      : `Trial applied successfully! Enjoy ${trialDuration} days of complimentary access.`;

    res.status(201).json({
      success: true,
      message: message,
      data: trialOrder,
    });
  } catch (error) {
    console.error(`[ERROR] applyTrial: ${error.message}`);
    console.error(`[ERROR] Full error:`, error);
    res.status(500).json({
      success: false,
      message: "Error applying for trial.",
      error: error.message,
    });
  }
};

// 4️⃣ Submit review after trial
const submitReview = async (req, res) => {
  try {
    const { providerId, rating, comment } = req.body;
    const studentId = req.user._id;

    // Validation
    if (!providerId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Please provide providerId and rating.",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // Check if trial order exists for this student-provider pair
    const trialOrder = await TrialOrder.findOne({
      studentId: studentId,
      providerId: providerId,
    });

    if (!trialOrder) {
      return res.status(403).json({
        success: false,
        message: "You must complete a trial before submitting a review.",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      studentId: studentId,
      providerId: providerId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a review for this provider.",
      });
    }

    // Create review
    const review = new Review({
      studentId: studentId,
      providerId: providerId,
      rating: parseInt(rating),
      comment: comment || "",
    });

    await review.save();

    // Mark trial as reviewed
    await TrialOrder.findByIdAndUpdate(trialOrder._id, { reviewed: true });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting review.",
      error: error.message,
    });
  }
};

// 5️⃣ Create monthly subscription
const createSubscription = async (req, res) => {
  try {
    const { providerId, plan, price, kitchenName } = req.body;
    const studentId = req.user._id;
    
    console.log(`\n[DEBUG] ========== CREATE SUBSCRIPTION ==========`);
    console.log(`[DEBUG] Received REQUEST BODY:`, req.body);
    console.log(`[DEBUG] providerId from body:`, providerId);
    console.log(`[DEBUG] providerId TYPE:`, typeof providerId);
    console.log(`[DEBUG] plan from body:`, plan);
    console.log(`[DEBUG] price from body:`, price);
    console.log(`[DEBUG] kitchenName from body:`, kitchenName);
    
    console.log(`[DEBUG] Current authenticated user:`, req.user);
    console.log(`[DEBUG] Student ID: ${studentId}`);
    console.log(`[DEBUG] Student Name: ${req.user.name}`);
    console.log(`[DEBUG] Student Email: ${req.user.email}`);
    
    const Subscription = require("../models/Subscription");

    // Validation
    if (!providerId || !plan || !price) {
      return res.status(400).json({
        success: false,
        message: "Please provide providerId, plan, and price.",
      });
    }

    // Validate plan
    const validPlans = {
      "7days": 7,
      "30days": 30,
      "60days": 60,
      "90days": 90,
    };

    if (!validPlans[plan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan. Choose from: 7days, 30days, 60days, 90days.",
      });
    }

    // 🔥 CRITICAL FIX: Check if providerId is a ProviderProfile ID (wrong) or User ID (correct)
    console.log(`[DEBUG] Checking if providerId is valid...`);
    let actualProviderId = providerId;
    
    const User = require("../models/User");
    const providerUser = await User.findById(providerId);
    
    if (!providerUser) {
      // Maybe it's a ProviderProfile ID, not a User ID
      console.log(`[DEBUG] ⚠️ No user found with ID ${providerId}, trying as ProviderProfile ID...`);
      
      const providerProfile = await ProviderProfile.findById(providerId);
      if (providerProfile && providerProfile.userId) {
        actualProviderId = providerProfile.userId;
        console.log(`[DEBUG] ✅ Found ProviderProfile! Converting ID from ${providerId} to User ID ${actualProviderId}`);
      } else {
        console.log(`[DEBUG] ❌ ID is neither a User ID nor a valid ProviderProfile ID!`);
        return res.status(404).json({
          success: false,
          message: "Provider not found. Please select a valid provider.",
        });
      }
    } else {
      console.log(`[DEBUG] ✅ providerId is a valid User ID`);
    }

    // Check if subscription already exists for this student-provider pair
    const existingSubscription = await Subscription.findOne({
      studentId: studentId,
      providerId: actualProviderId,
      active: true,
    });

    if (existingSubscription) {
      return res.status(409).json({
        success: false,
        message: "You already have an active subscription with this provider.",
      });
    }

    // Calculate subscription dates
    const now = new Date();
    const daysCount = validPlans[plan];
    const endDate = new Date(now.getTime() + daysCount * 24 * 60 * 60 * 1000);

    // Use provided kitchen name, or fetch from provider profile if not provided
    let finalKitchenName = kitchenName;
    let finalCity = "Location";

    if (!finalKitchenName) {
      const providerProfile = await ProviderProfile.findOne({
        userId: actualProviderId,
      });
      finalKitchenName = providerProfile?.kitchenName || "Kitchen";
      finalCity = providerProfile?.city || "Location";
    }

    // Get student name and email
    const studentName = req.user.name || "Student";
    const studentEmail = req.user.email || "";

    // Create subscription document
    const subscription = new Subscription({
      studentId: studentId,
      providerId: actualProviderId,
      plan: plan,
      price: price,
      startDate: now,
      endDate: endDate,
      finalPrice: price,
      active: true,
      kitchenName: finalKitchenName,
      city: finalCity,
      studentName: studentName,
      studentEmail: studentEmail,
    });

    console.log(`[DEBUG] ABOUT TO SAVE subscription document with:`);
    console.log(`[DEBUG]   - studentId: ${studentId}`);
    console.log(`[DEBUG]   - providerId: ${actualProviderId} (was ${providerId}, converted: ${actualProviderId !== providerId})`);
    console.log(`[DEBUG]   - studentName: ${studentName}`);
    console.log(`[DEBUG]   - studentEmail: ${studentEmail}`);
    console.log(`[DEBUG]   - plan: ${plan}`);
    console.log(`[DEBUG]   - kitchenName: ${finalKitchenName}`);

    // Save subscription
    await subscription.save();

    console.log(`[DEBUG] ✅ SUBSCRIPTION SAVED`);
    console.log(`[DEBUG] Saved subscription _id: ${subscription._id}`);
    console.log(`[DEBUG] Saved with providerId: ${subscription.providerId}`);

    // Populate provider details for response
    await subscription.populate("providerId", "kitchenName city");

    console.log(`[DEBUG] ========== END CREATE SUBSCRIPTION ==========\n`);

    res.status(201).json({
      success: true,
      message: `Subscription created successfully for ${daysCount} days!`,
      data: {
        _id: subscription._id,
        studentId: subscription.studentId,
        providerId: subscription.providerId,
        plan: subscription.plan,
        price: subscription.price,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        finalPrice: subscription.finalPrice,
        active: subscription.active,
      },
      subscription: subscription, // Include full subscription in response
    });
  } catch (error) {
    console.error(`[ERROR] createSubscription: ${error.message}`);
    console.error(`[ERROR] Full error:`, error);
    res.status(500).json({
      success: false,
      message: "Error creating subscription.",
      error: error.message,
    });
  }
};

// Get student's active subscriptions
const getStudentSubscriptions = async (req, res) => {
  try {
    const studentId = req.user._id;
    const Subscription = require("../models/Subscription");

    const subscriptions = await Subscription.find({
      studentId: studentId,
      active: true,
    }).sort({ createdAt: -1 });

    // Format response with all stored data
    const formattedSubscriptions = subscriptions.map((sub) => ({
      _id: sub._id,
      studentId: sub.studentId,
      providerId: sub.providerId,
      plan: sub.plan,
      price: sub.price,
      startDate: sub.startDate,
      endDate: sub.endDate,
      finalPrice: sub.finalPrice,
      active: sub.active,
      kitchenName: sub.kitchenName,
      city: sub.city,
    }));

    res.status(200).json({
      success: true,
      message: "Subscriptions retrieved successfully.",
      count: formattedSubscriptions.length,
      data: formattedSubscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching subscriptions.",
      error: error.message,
    });
  }
};

// Update all old subscriptions with generic "Kitchen" name to have correct kitchen names
const updateOldSubscriptions = async (req, res) => {
  try {
    const Subscription = require("../models/Subscription");

    // Find all subscriptions with generic "Kitchen" name
    const oldSubscriptions = await Subscription.find({
      kitchenName: "Kitchen",
    });

    if (oldSubscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No old subscriptions to update.",
        updated: 0,
      });
    }

    let updatedCount = 0;

    // Update each subscription with the correct kitchen name
    for (const subscription of oldSubscriptions) {
      try {
        const providerProfile = await ProviderProfile.findOne({
          userId: subscription.providerId,
        });

        if (providerProfile) {
          subscription.kitchenName = providerProfile.kitchenName;
          subscription.city = providerProfile.city || "Location";
          await subscription.save();
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error updating subscription ${subscription._id}:`, error.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Updated ${updatedCount} subscriptions with correct kitchen names.`,
      updated: updatedCount,
      total: oldSubscriptions.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating subscriptions.",
      error: error.message,
    });
  }
};

// 6️⃣ Delete subscription
const deleteSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    // Find and delete the subscription
    const subscription = await Subscription.findByIdAndDelete(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully.",
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting subscription.",
      error: error.message,
    });
  }
};

// 2️⃣ D Delete a trial
const deleteStudentTrial = async (req, res) => {
  try {
    const { trialId } = req.params;
    const userId = req.user.id;

    // Find the trial
    const trial = await TrialOrder.findById(trialId);

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: "Trial not found.",
      });
    }

    // Make sure the trial belongs to the student
    if (trial.studentId.toString() !== userId) {
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

// 5️⃣ E Pause subscription
const pauseSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const studentId = req.user._id;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      studentId: studentId,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    if (subscription.status === "paused") {
      return res.status(400).json({
        success: false,
        message: "Subscription is already paused.",
      });
    }

    // Set pause state
    subscription.status = "paused";
    subscription.pausedAt = new Date();

    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription paused successfully.",
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error pausing subscription.",
      error: error.message,
    });
  }
};

// 5️⃣ F Resume subscription
const resumeSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const studentId = req.user._id;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      studentId: studentId,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    if (subscription.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Subscription is already active.",
      });
    }

    if (!subscription.pausedAt) {
      return res.status(400).json({
        success: false,
        message: "Subscription was not paused.",
      });
    }

    const now = new Date();
    const pausedDuration = now.getTime() - new Date(subscription.pausedAt).getTime();

    // Recalculate end date by shifting it by the paused duration
    const oldEndDate = new Date(subscription.endDate);
    const newEndDate = new Date(oldEndDate.getTime() + pausedDuration);

    subscription.status = "active";
    subscription.accumulatedPausedTime = (subscription.accumulatedPausedTime || 0) + pausedDuration;
    subscription.endDate = newEndDate;
    subscription.pausedAt = null;

    await subscription.save();

    res.status(200).json({
      success: true,
      message: `Subscription resumed successfully. End date extended!`,
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resuming subscription.",
      error: error.message,
    });
  }
};

// 6️⃣ Get delivery logs history for student
const getStudentDeliveryLogs = async (req, res) => {
  try {
    const studentId = req.user._id;
    const DeliveryLog = require("../models/DeliveryLog");

    const logs = await DeliveryLog.find({ studentId: studentId })
      .populate("providerId", "name email")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: "Delivery logs retrieved successfully.",
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching delivery logs.",
      error: error.message,
    });
  }
};

module.exports = {
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
};
