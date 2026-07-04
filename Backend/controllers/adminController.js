import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

// GET /api/admin/stats  (admin dashboard summary cards)
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalSeekers,
      totalEmployers,
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "seeker" }),
      User.countDocuments({ role: "employer" }),
      Job.countDocuments(),
      Job.countDocuments({ status: "active" }),
      Job.countDocuments({ status: "closed" }),
      Application.countDocuments(),
    ]);

    res.status(200).json({
      totalUsers,
      totalSeekers,
      totalEmployers,
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplications,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete an admin account" });
    }
    await user.deleteOne();
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/jobs  (all jobs across all employers)
export const getAllJobsAdmin = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate("employer", "firstname lastname company email").sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/applications  (all applications across the whole platform)
export const getAllApplicationsAdmin = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate("job", "title company")
      .populate("applicant", "firstname lastname email")
      .sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};
