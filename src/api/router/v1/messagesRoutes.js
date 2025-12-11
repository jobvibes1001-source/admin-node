const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/authMiddleware");

router.get("/conversations", authenticate, (req, res) => {
  res.json({ items: [] });
});

router.get("/:conversationId", authenticate, (req, res) => {
  res.json({ id: req.params.conversationId, messages: [] });
});

router.post("/send", authenticate, (req, res) => {
  res.status(201).json({ id: "message_stub" });
});

router.patch("/:messageId/read", authenticate, (req, res) => {
  res.json({ id: req.params.messageId, read: true });
});

module.exports = router;
