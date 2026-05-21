const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// CORS configuration with dynamic origin support
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from localhost on any port (3000, 3001, etc.)
    // Also allow requests without origin header (like mobile apps)
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      process.env.CORS_ORIGIN,
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS reject: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Built-in middleware - exclude multipart/form-data from JSON parser
app.use(express.json({
  // Skip JSON parsing for multipart requests
  type: (req) => {
    const contentType = req.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      return false; // Don't parse as JSON
    }
    return true;
  }
}));

app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Static files middleware - serve uploads directory
app.use('/uploads', express.static('uploads'));

// Import routes
const authRoutes = require("./routes/authRoutes");
const providerRoutes = require("./routes/providerRoutes");
const studentRoutes = require("./routes/studentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Provider routes
app.use("/api/provider", providerRoutes);

// Student routes - NOW with /student prefix
app.use("/api/student", studentRoutes);

// Payment routes
app.use("/api/payment", paymentRoutes);

module.exports = app;
