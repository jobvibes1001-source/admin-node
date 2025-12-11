const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/authMiddleware");
const { getMatchesService } = require("../../services/applicationService");
const { sendResponse } = require("../../../utility/responseFormat");

// ⚠️ IMPORTANT: More specific routes must come before parameterized routes
// Matches route must be before /:id route to avoid route conflicts

router.get("/matches", authenticate, async (req, res) => {
  try {
    const result = await getMatchesService(req);
    // Service returns: { status, statusCode, message, data }
    sendResponse(res, {
      statusCode: result.statusCode || 200,
      message: result.message || "Matches fetched successfully",
      data: result.data || {
        results: [],
        pagination: {
          total: 0,
          totalPages: 0,
          page: parseInt(req.query.page || 1),
          limit: parseInt(req.query.limit || 10),
        },
      },
    });
  } catch (error) {
    console.error("Error in matches route:", error);
    sendResponse(res, {
      statusCode: 500,
      message: error.message || "Failed to fetch matches",
      data: {
        results: [],
        pagination: {
          total: 0,
          totalPages: 0,
          page: parseInt(req.query.page || 1),
          limit: parseInt(req.query.limit || 10),
        },
      },
    });
  }
});

router.get("/", authenticate, (req, res) => {
  res.json({ items: [], total: 0 });
});

router.get("/job/:jobId", authenticate, (req, res) => {
  res.json({ jobId: req.params.jobId, items: [] });
});

router.get("/user/:userId", authenticate, (req, res) => {
  res.json({ userId: req.params.userId, items: [] });
});

router.get("/:id/match-score", authenticate, (req, res) => {
  res.json({ id: req.params.id, score: 0 });
});

router.get("/:id", authenticate, (req, res) => {
  res.json({ id: req.params.id });
});

router.post("/", authenticate, (req, res) => {
  res.status(201).json({ id: "application_stub" });
});

router.patch("/:id/status", authenticate, (req, res) => {
  res.json({ id: req.params.id, status: req.body?.status || "updated" });
});

router.post("/:id/interview", authenticate, (req, res) => {
  res.json({ id: req.params.id, interview: "scheduled" });
});

module.exports = router;
