const Feed = require("../../models/feedSchema");
const File = require("../../models/fileSchema");
const { getPaginatedResults } = require("../../utility/paginate");
const path = require("path");

// Local file storage is used; ensure static serving of the uploads directory in your server

// --------------------
// Helper for uploads (local disk)
// --------------------
const uploadFilesToLocal = async (files) => {
  const uploads = await Promise.all(
    files.map(async (file) => {
      // Build URL from absolute path to preserve subdirectories (e.g., uploads/videos)
      const relativePath = path
        .relative(process.cwd(), file.path)
        .replace(/\\/g, "/");
      const publicUrl = `/${relativePath}`;

      const fileDoc = await File.create({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        url: publicUrl,
        size: file.size,
      });

      return {
        ...fileDoc._doc,
      };
    })
  );

  return uploads;
};

// --------------------
// Helper: build absolute URL
// --------------------
const buildAbsoluteUrl = (pathOrUrl, req) => {
  if (!pathOrUrl) return pathOrUrl;
  // if already absolute (http/https), return as is
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = `${req.protocol}://${req.get("host")}`;
  return `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
};

// --------------------
// Services
// --------------------

exports.listJobsService = async (req) => {
  try {
    const { page = 1, limit = 10, q = "", status, source } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { skills: { $in: [q] } },
      ];
    }
    if (status) filter.status = status;
    if (source) filter.source = source;

    const result = await getPaginatedResults(Feed, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    if (result && result.data && Array.isArray(result.data.results)) {
      const absResults = result.data.results.map((doc) => {
        const obj = doc && doc.toObject ? doc.toObject() : doc;
        if (obj && Array.isArray(obj.media)) {
          obj.media = obj.media.map((u) => buildAbsoluteUrl(u, req));
        }
        return obj;
      });
      result.data.results = absResults;
    }

    return result;
  } catch (error) {
    return {
      status: false,
      message: error.message,
      data: {
        results: [],
        pagination: { total: 0, totalPages: 0, page: 1, limit: 10 },
      },
    };
  }
};

exports.getJobByIdService = async (req) => {
  try {
    const job = await Feed.findById(req.params.id).lean();
    if (!job) return { status: false, message: "Job not found", data: {} };
    const jobObj = job;
    if (jobObj && Array.isArray(jobObj.media)) {
      jobObj.media = jobObj.media.map((u) => buildAbsoluteUrl(u, req));
    }
    return { status: true, message: "Job fetched", data: jobObj };
  } catch (error) {
    return { status: false, message: error.message, data: {} };
  }
};

exports.acceptFeedService = async (req) => {
  try {
    const updated = await Feed.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    ).lean();
    if (!updated) return { status: false, message: "Job not found", data: {} };
    const updatedObj = updated;
    if (updatedObj && Array.isArray(updatedObj.media)) {
      updatedObj.media = updatedObj.media.map((u) => buildAbsoluteUrl(u, req));
    }
    return { status: true, message: "Job approved", data: updatedObj };
  } catch (error) {
    return { status: false, message: error.message, data: {} };
  }
};

exports.rejectFeedService = async (req) => {
  try {
    const updated = await Feed.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).lean();
    if (!updated) return { status: false, message: "Job not found", data: {} };
    const updatedObj = updated;
    if (updatedObj && Array.isArray(updatedObj.media)) {
      updatedObj.media = updatedObj.media.map((u) => buildAbsoluteUrl(u, req));
    }
    return { status: true, message: "Job rejected", data: updatedObj };
  } catch (error) {
    return { status: false, message: error.message, data: {} };
  }
};

exports.createJobService = async (req) => {
  try {
    console.log("Request parameters in create job API service:--", req.body);

    let uploadedMedia = [];
    if (req.files && req.files.length > 0) {
      console.log("Saving media files to local storage...");
      uploadedMedia = await uploadFilesToLocal(req.files);
    }

    req.body.authorId = req.user.sub;
    req.body.authorRole = "admin";
    if (uploadedMedia.length) {
      req.body.media = uploadedMedia.map((m) => m.url);
    }

    const created = await Feed.create(req.body);

    // Build absolute media URLs in response (do not change DB values)
    const createdObj = created.toObject ? created.toObject() : created;
    if (createdObj && Array.isArray(createdObj.media)) {
      createdObj.media = createdObj.media.map((u) => buildAbsoluteUrl(u, req));
    }

    return { status: true, message: "Job created", data: createdObj };
  } catch (error) {
    console.log("Error in create job API service:--", error);
    return { status: false, message: error.message, data: {} };
  }
};

exports.updateJobService = async (req) => {
  try {
    const updated = await Feed.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();
    if (!updated) return { status: false, message: "Job not found", data: {} };
    const updatedObj = updated;
    if (updatedObj && Array.isArray(updatedObj.media)) {
      updatedObj.media = updatedObj.media.map((u) => buildAbsoluteUrl(u, req));
    }
    return { status: true, message: "Job updated", data: updatedObj };
  } catch (error) {
    console.log("Error in update job API service:--", error);
    return { status: false, message: error.message, data: {} };
  }
};

exports.deleteJobService = async (req) => {
  try {
    const deleted = await Feed.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return { status: false, message: "Job not found", data: {} };
    return { status: true, message: "Job deleted", data: {} };
  } catch (error) {
    console.log("Error in delete job API service:--", error);
    return { status: false, message: error.message, data: {} };
  }
};

exports.publishJobService = async (req) => {
  try {
    const updated = await Feed.findByIdAndUpdate(
      req.params.id,
      { status: "open" },
      { new: true }
    ).lean();
    if (!updated) return { status: false, message: "Job not found", data: {} };
    const updatedObj = updated;
    if (updatedObj && Array.isArray(updatedObj.media)) {
      updatedObj.media = updatedObj.media.map((u) => buildAbsoluteUrl(u, req));
    }
    return { status: true, message: "Job published", data: updatedObj };
  } catch (error) {
    console.log("Error in publish job API service:--", error);
    return { status: false, message: error.message, data: {} };
  }
};

exports.unpublishJobService = async (req) => {
  try {
    const updated = await Feed.findByIdAndUpdate(
      req.params.id,
      { status: "paused" },
      { new: true }
    ).lean();
    if (!updated) return { status: false, message: "Job not found", data: {} };
    const updatedObj = updated;
    if (updatedObj && Array.isArray(updatedObj.media)) {
      updatedObj.media = updatedObj.media.map((u) => buildAbsoluteUrl(u, req));
    }
    return { status: true, message: "Job unpublished", data: updatedObj };
  } catch (error) {
    console.log("Error in unpublish job API service:--", error);
    return { status: false, message: error.message, data: {} };
  }
};

exports.uploadVideoService = async (req) => {
  try {
    if (!req.files || req.files.length === 0)
      return { status: false, message: "No video file uploaded", data: [] };

    console.log("Saving video files to local storage...");
    const uploaded = await uploadFilesToLocal(req.files);

    // Return absolute URLs in response
    const responseFiles = uploaded.map((f) => ({
      ...f,
      url: buildAbsoluteUrl(f.url, req),
    }));

    return {
      status: true,
      message: "Video(s) uploaded successfully",
      data: responseFiles,
    };
  } catch (error) {
    console.log("Error in upload video API service:--", error);
    return { status: false, message: error.message, data: [] };
  }
};
