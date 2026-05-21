const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Coupon = require('../models/Coupon');

// Create a coupon
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { menuId, code, discountType, discountValue, validDays, validUntil } = req.body;

    // Validate required fields
    if (!menuId || !code || !discountType || discountValue === undefined) {
      return res.status(400).json({ message: 'Missing required fields: menuId, code, discountType, discountValue' });
    }

    if (!['percent', 'flat'].includes(discountType)) {
      return res.status(400).json({ message: 'discountType must be either "percent" or "flat"' });
    }

    if (discountValue <= 0) {
      return res.status(400).json({ message: 'discountValue must be greater than 0' });
    }

    // Calculate expiry date
    let expiryDate;
    if (validUntil) {
      expiryDate = new Date(validUntil);
    } else if (validDays) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(validDays));
    } else {
      // Default to 30 days from now
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
    }

    const coupon = new Coupon({
      providerId: req.user.id,
      menuId,
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: parseFloat(discountValue),
      validDays: parseInt(validDays) || 7,
      validUntil: validUntil ? new Date(validUntil) : null,
      expiryDate: expiryDate,
      isActive: true
    });

    await coupon.save();
    res.status(201).json({ message: 'Coupon created successfully', data: coupon });
  } catch (error) {
    console.error('Coupon creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get provider coupons
router.get('/', authMiddleware, async (req, res) => {
  try {
    const coupons = await Coupon.find({ providerId: req.user.id }).populate('menuId');
    res.json({ data: coupons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
