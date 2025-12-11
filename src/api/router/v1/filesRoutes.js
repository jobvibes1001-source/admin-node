const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/authMiddleware");

router.post("/image", authenticate, (req, res) => {
  res.status(201).json({ id: "file_img", url: "/uploads/demo.jpg" });
});

router.post("/video", authenticate, (req, res) => {
  res.status(201).json({ id: "file_video", url: "/uploads/demo.mp4" });
});

router.post("/document", authenticate, (req, res) => {
  res.status(201).json({ id: "file_doc", url: "/uploads/demo.pdf" });
});

router.delete("/:fileId", authenticate, (req, res) => {
  res.status(204).send();
});

router.get("/:fileId/url", authenticate, (req, res) => {
  res.json({ id: req.params.fileId, url: "/uploads/demo" });
});

module.exports = router;
