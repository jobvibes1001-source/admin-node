console.log("🚀 Starting JobVibe Admin Backend...");
console.log(`📦 Node version: ${process.version}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
console.log("✅ Express app initialized");

// Load router with error handling
let router;
try {
  router = require("./src/api/router");
} catch (error) {
  console.error("❌ Failed to load router:", error);
  // Create a minimal router to allow server to start
  router = express.Router();
  router.get("*", (req, res) => {
    res.status(500).json({ error: "Router initialization failed", message: error.message });
  });
}

// Enable CORS
app.use(cors());

// MongoDB connection
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

// Serve static files
app.use("/uploads", express.static(path.resolve("uploads")));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (required by Cloud Run)
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Routes
app.use("/api", router);

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "JobVibe Admin Backend API",
    status: "running"
  });
});

// Start server
const PORT = process.env.PORT || process.env.NODE_PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

let server;
try {
  server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on ${HOST}:${PORT}`);
    console.log(`📡 Health check available at http://${HOST}:${PORT}/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    } else {
      console.error('❌ Server error:', err);
    }
    process.exit(1);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
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
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
