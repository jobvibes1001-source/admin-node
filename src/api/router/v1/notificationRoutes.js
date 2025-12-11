const express = require("express");
const router = express.Router();

const validatorResponse = require("../../../utility/joiValidator");

const { authenticate } = require("../../middleware/authMiddleware");
const {
  getNotificationsController,
} = require("../../controllers/notificationsController");

router.get("/", authenticate, getNotificationsController);
router.get("/unread", authenticate, (req, res) => {
  res.json({ items: [] });
});
router.patch("/:id/read", authenticate, (req, res) => {
  res.json({ id: req.params.id, read: true });
});
router.patch("/mark-all-read", authenticate, (req, res) => {
  res.json({ allRead: true });
});
router.delete("/:id", authenticate, (req, res) => {
  res.status(204).send();
});
router.post("/", authenticate, (req, res) => {
  res.status(201).json({ id: "notification_stub" });
});

module.exports = router;
