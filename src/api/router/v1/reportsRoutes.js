const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/authMiddleware");

router.post("/users", authenticate, (req, res) => {
  res.json({ report: "users" });
});

router.post("/jobs", authenticate, (req, res) => {
  res.json({ report: "jobs" });
});

router.post("/applications", authenticate, (req, res) => {
  res.json({ report: "applications" });
});

router.get("/export/:type", authenticate, (req, res) => {
  res.json({ export: req.params.type });
});

module.exports = router;
