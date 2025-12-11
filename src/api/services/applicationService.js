const Application = require("../../models/applySchema");
const { getPaginatedResults } = require("../../utility/paginate");

/**
 * Get matches - applications with populated user (candidate) and feed (job) data
 * Supports pagination, search, and status filtering
 */
exports.getMatchesService = async (req) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;

    // Build filter - only get applications where is_applied is true
    const filter = {
      is_applied: true,
    };

    // Add status filter if provided
    if (status) {
      // Handle different status formats
      const statusLower = status.toLowerCase();
      if (statusLower === "all") {
        // Don't filter by status
      } else {
        filter.status = statusLower;
      }
    }

    // Get paginated applications with populated user and feed
    // Note: getPaginatedResults doesn't support multiple populate, so we'll do it manually
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = Application.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "userId",
        select: "name username email role profile_image experience skills",
      })
      .populate({
        path: "feedId",
        select: "job_title work_place_name job_type cities states company_name content notice_period is_immediate_joiner media status",
      })
      .lean();

    const [results, total] = await Promise.all([
      query.exec(),
      Application.countDocuments(filter),
    ]);

    // Filter by search term if provided (search in candidate name, job title, or company)
    let filteredResults = results;
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredResults = results.filter((app) => {
        const candidateName =
          app.userId?.name?.toLowerCase() ||
          app.userId?.username?.toLowerCase() ||
          "";
        const jobTitle = Array.isArray(app.feedId?.job_title)
          ? app.feedId.job_title[0]?.toLowerCase()
          : app.feedId?.job_title?.toLowerCase() || "";
        const company =
          app.feedId?.company_name?.toLowerCase() ||
          (Array.isArray(app.feedId?.work_place_name)
            ? app.feedId.work_place_name[0]?.toLowerCase()
            : app.feedId?.work_place_name?.toLowerCase()) ||
          "";

        return (
          candidateName.includes(searchLower) ||
          jobTitle.includes(searchLower) ||
          company.includes(searchLower)
        );
      });
    }

    // Transform results to match expected format
    const transformedResults = filteredResults.map((app) => {
      const candidate = app.userId || {};
      const job = app.feedId || {};

      return {
        _id: app._id,
        id: app._id,
        userId: app.userId?._id || app.userId,
        feedId: app.feedId?._id || app.feedId,
        status: app.status || (app.is_applied ? "applied" : "pending"),
        is_applied: app.is_applied,
        createdAt: app.createdAt,
        appliedDate: app.createdAt,
        // Candidate data
        user: candidate,
        candidate: candidate,
        candidateName: candidate.name || candidate.username || "Unknown",
        candidateEmail: candidate.email || "",
        // Job data
        feed: job,
        job: job,
        jobTitle: Array.isArray(job.job_title)
          ? job.job_title[0]
          : job.job_title || "Unknown Position",
        company:
          job.company_name ||
          (Array.isArray(job.work_place_name)
            ? job.work_place_name[0]
            : job.work_place_name) ||
          "Unknown Company",
        // Additional fields
        matchScore: app.matchScore || app.match_score || 0,
        interviewScheduled:
          app.interviewScheduled ||
          app.interview_scheduled ||
          app.status === "interview_scheduled" ||
          app.status === "Interview Scheduled",
      };
    });

    // Recalculate pagination if search was applied
    const totalAfterSearch = search && search.trim() 
      ? filteredResults.length 
      : total;

    return {
      status: true,
      statusCode: 200,
      message: "Matches fetched successfully",
      data: {
        results: transformedResults,
        pagination: {
          total: totalAfterSearch,
          totalPages: Math.ceil(totalAfterSearch / parseInt(limit)),
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
    };
  } catch (err) {
    console.error("Error fetching matches:", err);
    return {
      status: false,
      statusCode: 500,
      message: "Error fetching matches",
      data: {
        results: [],
        pagination: {
          total: 0,
          totalPages: 0,
          page: parseInt(req.query.page || 1),
          limit: parseInt(req.query.limit || 10),
        },
        error: err.message,
      },
    };
  }
};

