const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/authMiddleware");

router.get("/", authenticate, (req, res) => {
  res.json({ items: [] });
});

router.get("/:id", authenticate, (req, res) => {
  res.json({ id: req.params.id });
});

router.post("/schedule", authenticate, (req, res) => {
  res.status(201).json({ id: "interview_stub" });
});

router.put("/:id", authenticate, (req, res) => {
  res.json({ id: req.params.id, updated: true });
});

router.post("/:id/cancel", authenticate, (req, res) => {
  res.json({ id: req.params.id, status: "cancelled" });
});

router.post("/:id/complete", authenticate, (req, res) => {
  res.json({ id: req.params.id, status: "completed" });
});

router.get("/user/:userId", authenticate, (req, res) => {
  res.json({ userId: req.params.userId, items: [] });
});

module.exports = router;
