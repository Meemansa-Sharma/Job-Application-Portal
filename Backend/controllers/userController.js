import User from "../models/User.js";
import Job from "../models/Job.js";

// PUT /api/users/me  (any logged-in user - profile.html "Save changes")

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const commonFields = ["firstname", "lastname", "phone"];
    commonFields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    if (user.role === "seeker") {
      const seekerFields = ["location", "about", "skills", "linkedin", "github"];
      seekerFields.forEach((field) => {
        if (req.body[field] !== undefined) user[field] = req.body[field];
      });
      if (req.body.education) {
        user.education = { ...user.education.toObject(), ...req.body.education };
      }
    }

    if (user.role === "employer") {
      const employerFields = [
        "company",
        "industry",
        "companySize",
        "founded",
        "headquarters",
        "companyDescription",
      ];
      employerFields.forEach((field) => {
        if (req.body[field] !== undefined) user[field] = req.body[field];
      });
    }

    await user.save();

    const safeUser = await User.findById(user._id).select("-password");
    res.status(200).json({
      user: safeUser,
      profileCompletion: safeUser.getProfileCompletion(),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/resume  (seeker only, multipart/form-data with "resume" file)
export const uploadProfileResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }
    const user = await User.findById(req.user._id);
    user.resume = req.file.path;
    await user.save();

    res.status(200).json({
      message: "Resume uploaded",
      resume: user.resume,
      profileCompletion: user.getProfileCompletion(),
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/resume  (seeker only - "Remove resume")
export const removeProfileResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.resume = "";
    await user.save();
    res.status(200).json({
      message: "Resume removed",
      profileCompletion: user.getProfileCompletion(),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/saved-jobs/:jobId  (seeker only - "Save job" button)
export const saveJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    const user = await User.findById(req.user._id);
    if (!user.savedJobs.includes(job._id)) {
      user.savedJobs.push(job._id);
      await user.save();
    }
    res.status(200).json({ message: "Job saved", savedJobs: user.savedJobs });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/saved-jobs/:jobId  (seeker only - "Unsave" button)
export const unsaveJob = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedJobs = user.savedJobs.filter((id) => id.toString() !== req.params.jobId);
    await user.save();
    res.status(200).json({ message: "Job removed from saved list", savedJobs: user.savedJobs });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/saved-jobs  (seeker only - "Saved jobs" stat / list)
export const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedJobs",
      populate: { path: "employer", select: "firstname lastname company" },
    });
    res.status(200).json(user.savedJobs);
  } catch (error) {
    next(error);
  }
};
