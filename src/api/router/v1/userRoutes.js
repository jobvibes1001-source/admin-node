const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const validatorResponse = require("../../../utility/joiValidator");
const {
  step1Controller,
  step2Controller,
  step3Controller,
  uploadController,
  skillsController,
  updateController,
  getProfileController,
  getFeedController,
} = require("../../controllers/userController.js");
const { authenticate } = require("../../middleware/authMiddleware");
const {
  step1Schema,
} = require("../../validationSchema/userValidationSchema.js");

// Uploads folder path (serve from project root /uploads)
const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // save to uploads/ folder
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_"); // replace spaces with underscores
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

router.post("/update", authenticate, updateController);

router.post(
  "/upload",
  authenticate,
  upload.array("files", 5),
  uploadController
);

// Dashboard USERS endpoints
const {
  listUsersForAdmin,
  getUserForAdmin,
} = require("../../controllers/userAdminController");
router.get("/", authenticate, listUsersForAdmin);
router.get("/profile", authenticate, (req, res) => {
  res.json({ me: true });
});
router.put("/profile", authenticate, (req, res) => {
  res.json({ updated: true });
});
router.post("/avatar", authenticate, (req, res) => {
  res.json({ uploaded: true });
});
router.get("/candidates", authenticate, (req, res) => {
  res.json({ items: [] });
});
router.get("/hr-managers", authenticate, (req, res) => {
  res.json({ items: [] });
});
router.get("/recruiters", authenticate, (req, res) => {
  res.json({ items: [] });
});

// Get user details by id (admin shape)
router.get("/:id", authenticate, getUserForAdmin);

router.get("/:userId/post", authenticate, getFeedController);

module.exports = router;
