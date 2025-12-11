const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/authMiddleware");

router.get("/", authenticate, (req, res) => {
  res.json({ items: [], total: 0 });
});

router.get("/search", authenticate, (req, res) => {
  res.json({ items: [], total: 0, query: req.query.q || "" });
});

router.get("/:id", authenticate, (req, res) => {
  res.json({ id: req.params.id });
});

router.get("/user/:userId", authenticate, (req, res) => {
  res.json({ userId: req.params.userId, items: [] });
});

router.post("/", authenticate, (req, res) => {
  res.status(201).json({ id: "resume_stub" });
});

router.put("/:id", authenticate, (req, res) => {
  res.json({ id: req.params.id, updated: true });
});

router.delete("/:id", authenticate, (req, res) => {
  res.status(204).send();
});

router.post("/:id/video", authenticate, (req, res) => {
  res.json({ id: req.params.id, video: "uploaded" });
});

router.post("/:id/document", authenticate, (req, res) => {
  res.json({ id: req.params.id, document: "uploaded" });
});

router.get("/:id/download", authenticate, (req, res) => {
  res.json({ id: req.params.id, download: true });
});

module.exports = router;
