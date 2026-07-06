import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// POST /api/applications/:jobId  (seeker only, multipart/form-data with "resume" file)
export const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    let resumePath = req.file ? req.file.path : null;
    if (!resumePath) {
      const user = await User.findById(req.user._id);
      resumePath = user.resume || null;
    }
    if (!resumePath) {
      return res.status(400).json({ message: "A resume is required. Upload one with this application or add one to your profile first." });
    }

    const alreadyApplied = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (alreadyApplied) {
      return res.status(400).json({ message: "You already applied to this job" });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      resume: resumePath,
      coverLetter: coverLetter || "",
    });

    // let the employer know someone applied
    await Notification.create({
      user: job.employer,
      message: `New application received for "${job.title}"`,
      type: "new_applicant",
      relatedJob: job._id,
      relatedApplication: application._id,
    });

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/my  (seeker only - "track my applications")
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate("job", "title company location type status salary")
      .sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/applications/:id  (seeker only, must own it - "Withdraw" button)

export const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only withdraw your own applications" });
    }
    if (!["applied", "review"].includes(application.status)) {
      return res.status(400).json({ message: "This application can no longer be withdrawn" });
    }
    await application.deleteOne();
    res.status(200).json({ message: "Application withdrawn" });
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/job/:jobId  (employer only, must own the job - view applicants)
export const getApplicantsForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only view applicants for your own jobs" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("applicant", "firstname lastname email phone resume skills")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/employer/mine  (employer only - "Applicants" tab across ALL of their jobs)
export const getAllApplicantsForEmployer = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).select("_id");
    const jobIds = jobs.map((j) => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("job", "title")
      .populate("applicant", "firstname lastname email phone resume skills")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

// PUT /api/applications/:id/status  (employer only, must own the related job)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, interviewDate, interviewTime, interviewMode, interviewLink, interviewNotes } = req.body;
    const validStatuses = ["applied", "review", "interview", "selected", "rejected"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const application = await Application.findById(req.params.id).populate("job");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only manage applicants for your own jobs" });
    }

    application.status = status;
    if (status === "interview") {
      application.interviewDate = interviewDate || application.interviewDate;
      application.interviewTime = interviewTime || application.interviewTime;
      application.interviewMode = interviewMode || application.interviewMode;
      application.interviewLink = interviewLink || application.interviewLink;
      application.interviewNotes = interviewNotes || application.interviewNotes;
    }
    await application.save();

    // let the seeker know their status changed
    const statusMessages = {
      review: `Your application for "${application.job.title}" is now under review`,
      interview: `Interview scheduled for "${application.job.title}"`,
      rejected: `Update on your application for "${application.job.title}"`,
      selected: `Congratulations! You've been selected for "${application.job.title}"`,
    };
    if (statusMessages[status]) {
      await Notification.create({
        user: application.applicant,
        message: statusMessages[status],
        type: status === "interview" ? "interview_scheduled" : "application_update",
        relatedJob: application.job._id,
        relatedApplication: application._id,
      });
    }

    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};
