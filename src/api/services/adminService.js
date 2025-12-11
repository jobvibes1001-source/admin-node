const User = require("../../models/userSchema");
const Job = require("../../models/feedSchema");
const Reaction = require("../../models/reactionSchema");
const Application = require("../../models/applySchema");

exports.getDashboard = async () => {
  // Run all count queries in parallel for performance
  const [usersCount, jobsCount, matchesCount, applicationsCount] =
    await Promise.all([
      // ✅ Count only users whose role is NOT 'admin'
      User.countDocuments({ role: { $ne: "admin" } }),
      Job.countDocuments(),
      Reaction.countDocuments(),
      Application.countDocuments({ is_applied: true }),
    ]);

  // Return unified dashboard data
  return {
    users: usersCount,
    jobs: jobsCount,
    matches: matchesCount,
    applications: applicationsCount,
  };
};

exports.getUsers = async () => {
  const [total, active] = await Promise.all([
    User.countDocuments({ role: { $ne: "admin" } }),
    User.countDocuments({ isActive: true }),
  ]);

  return { total, active };
};

exports.getJobs = async () => {
  const [total, published] = await Promise.all([
    Job.countDocuments(),
    Job.countDocuments({ published: true }),
  ]);

  return { total, published };
};

exports.getApplications = async () => {
  const total = await Application.countDocuments();

  const statuses = await Application.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const formattedStatuses = statuses.reduce((acc, s) => {
    acc[s._id] = s.count;
    return acc;
  }, {});

  return { total, statuses: formattedStatuses };
};

exports.getActivities = async () => {
  const items = await Activity.find({})
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("user", "name email");

  return { items };
};

exports.getSystemHealth = async () => {
  // You could add checks for DB, cache, etc.
  const dbState = ["disconnected", "connected", "connecting", "disconnecting"];
  const mongoose = require("mongoose");

  return { status: "ok", db: dbState[mongoose.connection.readyState] };
};
