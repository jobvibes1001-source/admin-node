console.log("🚀 Starting JobVibe Admin Backend...");
console.log(`📦 Node version: ${process.version}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Get PORT early and log it
const PORT = process.env.PORT || process.env.NODE_PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
console.log(`🔌 Will listen on ${HOST}:${PORT}`);
console.log(`📋 PORT env var: ${process.env.PORT || 'not set'}`);
console.log(`📋 NODE_PORT env var: ${process.env.NODE_PORT || 'not set'}`);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");

const app = express();
console.log("✅ Express app initialized");

// Health check endpoint (required by Cloud Run) - add this FIRST
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "JobVibe Admin Backend API",
    status: "running"
  });
});

// Enable CORS
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (only if directory exists)
const uploadsPath = path.resolve("uploads");
if (fs.existsSync(uploadsPath)) {
  app.use("/uploads", express.static(uploadsPath));
  console.log("✅ Static files enabled for /uploads");
} else {
  console.log("⚠️ Uploads directory not found, skipping static file serving");
}

// Load router with error handling
let router;
try {
  router = require("./src/api/router");
  console.log("✅ Router loaded successfully");
} catch (error) {
  console.error("❌ Failed to load router:", error);
  console.error("Stack:", error.stack);
  // Create a minimal router to allow server to start
  router = express.Router();
  router.get("*", (req, res) => {
    res.status(500).json({ error: "Router initialization failed", message: error.message });
  });
}

// Routes
app.use("/api", router);

// MongoDB connection (non-blocking, server starts even if DB fails)
const URL = process.env.MONGO_URI || "mongodb://localhost:27017/jobvibes";
mongoose.set("strictQuery", false);

async function connectDB() {
  try {
    await mongoose.connect(URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("--- MongoDB connected successfully ---");
  } catch (err) {
    console.error("--- DB Connection ERROR ---", err.message);
    console.log("⏳ Retrying MongoDB connection in 5s...");
    setTimeout(connectDB, 5000);
  }
}

// Start MongoDB connection (non-blocking)
connectDB();

// Reconnect on disconnect/error
mongoose.connection.on("disconnected", () => {
  console.error("⚠️ MongoDB disconnected! Reconnecting...");
  setTimeout(connectDB, 5000);
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err.message);
  mongoose.disconnect(); // force reconnect cycle
});

// Start server - THIS MUST HAPPEN LAST AND MUST SUCCEED
let server;
try {
  console.log(`🎯 Attempting to start server on ${HOST}:${PORT}...`);
  server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on ${HOST}:${PORT}`);
    console.log(`📡 Health check available at http://${HOST}:${PORT}/health`);
    console.log(`✅ Server is ready to accept connections`);
  });

  server.on('error', (err) => {
    console.error('❌ Server error event:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    } else {
      console.error('❌ Server error details:', err.message, err.stack);
    }
    // Don't exit immediately, let Cloud Run see the error
    setTimeout(() => process.exit(1), 1000);
  });

  // Verify server is listening
  server.on('listening', () => {
    const address = server.address();
    console.log(`✅ Server is listening on ${address.address}:${address.port}`);
  });

} catch (error) {
  console.error('❌ Failed to start server:', error);
  console.error('Stack:', error.stack);
  // Give time for logs to flush
  setTimeout(() => process.exit(1), 1000);
}

// Graceful shutdown
async function cleanup(signal) {
  console.log(`\nReceived ${signal}, closing server...`);
  try {
    await mongoose.connection.close();
    console.log("✅ Mongoose connection closed.");
    server.close(() => {
      console.log("✅ Express server closed.");
      process.exit(0); // Render or PM2/systemd will restart
    });
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => cleanup(signal));
});

// Crash handlers (let Render/PM2 restart the app)
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  console.error("Stack:", err.stack);
  // Give time for logs to flush before exiting
  setTimeout(() => process.exit(1), 1000);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
  // Log but don't exit immediately during startup
  // Only exit if server is already running
  if (server && server.listening) {
    setTimeout(() => process.exit(1), 1000);
  } else {
    console.error("⚠️ Unhandled rejection during startup - server may not be ready yet");
  }
});
