const User = require("../../models/userSchema");
const { getPaginatedResults } = require("../../utility/paginate");

exports.listUsersForAdmin = async (req, res, next) => {
  try {
    // Extract query parameters
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 10, 1);

    // Build search filter (name or email), always exclude admin users
    const baseFilter = { role: { $ne: "admin" } };

    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const filter = { ...baseFilter, ...searchFilter };

    // Get paginated results
    const paginated = await getPaginatedResults(User, filter, {
      page: pageNum,
      limit: limitNum,
      sort: { createdAt: -1 },
      lean: true,
    });

    const { results, pagination } = paginated.data;

    // Statistics (always exclude admin users)
    const stats = {
      totalUsers: await User.countDocuments({ role: { $ne: "admin" } }),
      totalCandidates: await User.countDocuments({ role: "candidate" }),
      totalEmployers: await User.countDocuments({ role: "employer" }),
    };

    // Send response
    res.status(200).json({
      status: true,
      message: "Users list fetched successfully",
      data: results,
      stats,
      pagination,
    });
  } catch (err) {
    console.error("Error in listUsersForAdmin:", err);
    next(err);
  }
};

exports.getUserForAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user)
      return res.send({ status: false, message: "Not found", data: {} });
    res.send({
      status: true,
      message: "User fetched",
      data: mapUserForAdmin(user),
    });
  } catch (err) {
    next(err);
  }
};
