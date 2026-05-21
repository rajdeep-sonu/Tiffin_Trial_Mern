const jwt = require("jsonwebtoken");

// Middleware to verify JWT and protect routes
const protect = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-env"
    );

    // Fetch full user from database to get name, email, etc.
    const User = require("../models/User");
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Attach full user to request
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized. Invalid token.",
    });
  }
};

// Middleware to authorize based on roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized. Only ${roles.join(", ")} can access this.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
