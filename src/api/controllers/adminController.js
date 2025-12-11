const { sendResponse } = require("../../utility/responseFormat");
const adminService = require("../services/adminService");

// 🧠 Dashboard overview
const getDashboard = async (req, res) => {
  try {
    console.log("Request body in getDashboard:--", req.body);
    const dashboardData = await adminService.getDashboard();
    console.log("Response in getDashboard:--", dashboardData);
    sendResponse(res, {
      statusCode: 200,
      message: "Dashboard data fetched successfully",
      data: dashboardData,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err.message || "Failed to fetch dashboard data",
    });
  }
};

// 👥 Users
const getUsers = async (req, res) => {
  try {
    const users = await adminService.getUsers();
    sendResponse(res, {
      statusCode: 200,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err.message || "Failed to fetch users",
    });
  }
};

// 💼 Jobs
const getJobs = async (req, res) => {
  try {
    const jobs = await adminService.getJobs();
    sendResponse(res, {
      statusCode: 200,
      message: "Jobs fetched successfully",
      data: jobs,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err.message || "Failed to fetch jobs",
    });
  }
};

// 📄 Applications
const getApplications = async (req, res) => {
  try {
    const applications = await adminService.getApplications();
    sendResponse(res, {
      statusCode: 200,
      message: "Applications fetched successfully",
      data: applications,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err.message || "Failed to fetch applications",
    });
  }
};

// 🕓 Activities
const getActivities = async (req, res) => {
  try {
    const activities = await adminService.getActivities();
    sendResponse(res, {
      statusCode: 200,
      message: "Activities fetched successfully",
      data: activities,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err.message || "Failed to fetch activities",
    });
  }
};

// 💻 System Health
const getSystemHealth = async (req, res) => {
  try {
    const systemHealth = await adminService.getSystemHealth();
    sendResponse(res, {
      statusCode: 200,
      message: "System health fetched successfully",
      data: systemHealth,
    });
  } catch (err) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: err.message || "Failed to fetch system health",
    });
  }
};

// ✅ Export all controller methods
module.exports = {
  getDashboard,
  getUsers,
  getJobs,
  getApplications,
  getActivities,
  getSystemHealth,
};
