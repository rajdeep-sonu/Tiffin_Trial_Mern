const app = require("./app");
const connectDB = require("./config/db");

const BASE_PORT = parseInt(process.env.PORT) || 5000;
const MAX_PORT_ATTEMPTS = process.env.NODE_ENV === "production" ? 0 : 20; // Disable port-scanning on cloud hosts

let server = null;
let currentPort = BASE_PORT;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server with dynamic port fallback
    attemptStartOnPort(currentPort);

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

const attemptStartOnPort = (port) => {
  // Ensure port is a number
  port = parseInt(port);
  
  if (port > BASE_PORT + MAX_PORT_ATTEMPTS) {
    console.error(`\n❌ Could not find free port after ${MAX_PORT_ATTEMPTS} attempts`);
    console.error(`   Tried ports: ${BASE_PORT} to ${BASE_PORT + MAX_PORT_ATTEMPTS}`);
    process.exit(1);
  }

  server = app.listen(port, () => {
    console.log(`\n✅ Server is running on port ${port}`);
    console.log(`📍 API URL: http://localhost:${port}`);
    currentPort = port;
  });

  // Handle port busy errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is busy, trying port ${port + 1}...`);
      server.close();
      
      // Try next port (ensure it's a number)
      attemptStartOnPort(parseInt(port) + 1);
    } else {
      console.error('🔴 Server error:', error.message);
      process.exit(1);
    }
  });
};

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  console.log(`\n📍 ${signal} signal received`);
  
  if (server) {
    console.log(`🛑 Closing server on port ${currentPort}...`);
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });

    // Force exit after 10 seconds if graceful shutdown takes too long
    setTimeout(() => {
      console.error('❌ Forced shutdown (graceful timeout)');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle process signals
process.on('SIGINT', () => gracefulShutdown('SIGINT (Ctrl+C)'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  if (error.stack) console.error('Stack:', error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Start the server
startServer();
