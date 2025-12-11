const express = require("express");
const router = express.Router();

// Dashboard API routes
router.use("/v1/", require("./apiRoutes"));

// Auth API routes
router.use("/v1/auth", require("./v1/authRoutes"));

// Admin API routes
router.use("/v1/admin", require("./v1/adminRoutes"));

// Non-versioned mounts to support dashboard endpoints (e.g., /api/auth/login)
router.use("/auth", require("./v1/authRoutes"));
router.use("/users", require("./v1/userRoutes"));
router.use("/feeds", require("./v1/feedsRoutes"));
router.use("/resumes", require("./v1/resumesRoutes"));
router.use("/applications", require("./v1/applicationsRoutes"));
router.use("/notifications", require("./v1/notificationRoutes"));
router.use("/settings", require("./v1/settingsRoutes"));
router.use("/files", require("./v1/filesRoutes"));
router.use("/messages", require("./v1/messagesRoutes"));
router.use("/interviews", require("./v1/interviewsRoutes"));
router.use("/reports", require("./v1/reportsRoutes"));

module.exports = router;
