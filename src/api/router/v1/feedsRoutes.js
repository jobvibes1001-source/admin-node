const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const { authenticate } = require("../../middleware/authMiddleware");
const {
  listJobsController,
  getJobByIdController,
  createJobController,
  updateJobController,
  deleteJobController,
  publishJobController,
  unpublishJobController,
  acceptFeedController,
  rejectFeedController,
  uploadVideoController,
} = require("../../controllers/jobController");

// -----------------------------
// Multer setup for video/media upload
// -----------------------------
const uploadDir = path.join(process.cwd(), "uploads", "videos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "video/mp4",
    "video/mkv",
    "video/quicktime",
    "video/webm",
    "video/ogg",
  ];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only video formats allowed."), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter,
});

// -----------------------------
// Routes
// -----------------------------

// GET /jobs
router.get("/", authenticate, listJobsController);

// GET /jobs/active
router.get("/active", authenticate, (req, res, next) => {
  req.query.status = "open";
  return listJobsController(req, res, next);
});

// GET /jobs/draft
router.get("/draft", authenticate, (req, res, next) => {
  req.query.status = "paused";
  return listJobsController(req, res, next);
});

// GET /jobs/search
router.get("/search", authenticate, listJobsController);

// POST /jobs
router.post("/", authenticate, upload.array("media", 5), createJobController);

// GET /jobs/:id
router.get("/:id", authenticate, getJobByIdController);

// PUT /jobs/:id/accept
router.put("/:id/accept", authenticate, acceptFeedController);

// PUT /jobs/:id/reject
router.put("/:id/reject", authenticate, rejectFeedController);

// PUT /jobs/:id
router.put("/:id", authenticate, updateJobController);

// DELETE /jobs/:id
router.delete("/:id", authenticate, deleteJobController);

// POST /jobs/:id/publish
router.post("/:id/publish", authenticate, publishJobController);

// POST /jobs/:id/unpublish
router.post("/:id/unpublish", authenticate, unpublishJobController);

// POST /jobs/:id/video
router.post(
  "/:id/video",
  authenticate,
  upload.array("video", 3),
  uploadVideoController
);

module.exports = router;
