const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/authMiddleware");
const adminController = require("../../controllers/adminController");

// Dashboard & metrics routes
router.get("/dashboard", authenticate, adminController.getDashboard);
router.get("/users", authenticate, adminController.getUsers);
router.get("/jobs", authenticate, adminController.getJobs);
router.get("/applications", authenticate, adminController.getApplications);
router.get("/activities", authenticate, adminController.getActivities);
router.get("/system-health", authenticate, adminController.getSystemHealth);

module.exports = router;
