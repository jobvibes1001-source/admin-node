const {
  listJobsService,
  getJobByIdService,
  createJobService,
  updateJobService,
  deleteJobService,
  publishJobService,
  unpublishJobService,
  acceptFeedService,
  rejectFeedService,
  uploadVideoService,
} = require("../services/jobServices");

exports.listJobsController = async (req, res, next) => {
  try {
    console.log("Request parameters in list jobs API controller:--", req.body);
    const data = await listJobsService(req);
    res.send(data);
    console.log("Response parameters in list jobs API controller:--", data);
  } catch (error) {
    console.log("Error in list jobs API controller:--", error);
    next(error);
  }
};

exports.getJobByIdController = async (req, res, next) => {
  try {
    console.log(
      "Request parameters in get job by ID API controller:--",
      req.body
    );
    const data = await getJobByIdService(req);
    res.send(data);
    console.log("Response parameters in get job by ID API controller:--", data);
  } catch (error) {
    console.log("Error in get job by ID API controller:--", error);
    next(error);
  }
};

exports.acceptFeedController = async (req, res, next) => {
  try {
    console.log(
      "Request parameters in accept feed API controller:--",
      req.body
    );
    const data = await acceptFeedService(req);
    res.send(data);
    console.log("Response parameters in accept feed API controller:--", data);
  } catch (error) {
    console.log("Error in accept feed API controller:--", error);
    next(error);
  }
};

exports.rejectFeedController = async (req, res, next) => {
  try {
    console.log(
      "Request parameters in reject feed API controller:--",
      req.body
    );
    const data = await rejectFeedService(req);
    res.send(data);
    console.log("Response parameters in reject feed API controller:--", data);
  } catch (error) {
    console.log("Error in reject feed API controller:--", error);
    next(error);
  }
};

exports.createJobController = async (req, res, next) => {
  try {
    console.log("Request parameters in create job API controller:--", req.body);
    console.log("Uploaded files in create job API controller:--", req.files);

    const data = await createJobService(req);
    res.send(data);
    console.log("Response parameters in create job API controller:--", data);
  } catch (error) {
    console.log("Error in create job API controller:--", error);
    next(error);
  }
};

exports.updateJobController = async (req, res, next) => {
  try {
    console.log("Request parameters in update job API controller:--", req.body);
    const data = await updateJobService(req);
    res.send(data);
    console.log("Response parameters in update job API controller:--", data);
  } catch (error) {
    console.log("Error in update job API controller:--", error);
    next(error);
  }
};

exports.deleteJobController = async (req, res, next) => {
  try {
    console.log("Request parameters in delete job API controller:--", req.body);
    const data = await deleteJobService(req);
    res.send(data);
    console.log("Response parameters in delete job API controller:--", data);
  } catch (error) {
    console.log("Error in delete job API controller:--", error);
    next(error);
  }
};

exports.publishJobController = async (req, res, next) => {
  try {
    console.log(
      "Request parameters in publish job API controller:--",
      req.body
    );
    const data = await publishJobService(req);
    res.send(data);
    console.log("Response parameters in publish job API controller:--", data);
  } catch (error) {
    console.log("Error in publish job API controller:--", error);
    next(error);
  }
};

exports.unpublishJobController = async (req, res, next) => {
  try {
    console.log(
      "Request parameters in unpublish job API controller:--",
      req.body
    );
    const data = await unpublishJobService(req);
    res.send(data);
    console.log("Response parameters in unpublish job API controller:--", data);
  } catch (error) {
    console.log("Error in unpublish job API controller:--", error);
    next(error);
  }
};

exports.uploadVideoController = async (req, res, next) => {
  try {
    console.log(
      "Request parameters in upload video API controller:--",
      req.body
    );
    console.log("Uploaded files in upload video API controller:--", req.files);

    const data = await uploadVideoService(req);
    res.send(data);
    console.log("Response parameters in upload video API controller:--", data);
  } catch (error) {
    console.log("Error in upload video API controller:--", error);
    next(error);
  }
};
