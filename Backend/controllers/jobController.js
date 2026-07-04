import Job from "../models/Job.js";
import { getAISkillAnalysis } from "../services/groqService.js";

// small helper - post-job.html's step-2 skills field currently posts as
// "skills" in the payload comment, while this API historically expected
// "tags". Accept either so the frontend isn't blocked on a rename.
const extractTags = (body) => body.tags || body.skills || [];

// small helper - computes a simple, deterministic skill-match score between
// a job's tags and a seeker's profile skills. This is the same 60%-style
// math the frontend currently fakes client-side, just computed server-side
// so it's consistent everywhere. (A future Groq-powered version could
// replace this without changing the response shape.)
export const computeSkillMatch = (jobTags = [], userSkills = []) => {
  if (!jobTags.length) return null;
  const normalizedUserSkills = userSkills.map((s) => s.toLowerCase());
  const matched = jobTags.filter((tag) => normalizedUserSkills.includes(tag.toLowerCase()));
  return {
    score: Math.round((matched.length / jobTags.length) * 100),
    matchedSkills: matched,
    missingSkills: jobTags.filter((tag) => !matched.includes(tag)),
  };
};

// POST /api/jobs  (employer only)
export const createJob = async (req, res, next) => {
  try {
    const { title, description, requirements, location, salary, type, experience, deadline } = req.body;

    if (!title || !description || !location || !deadline) {
      return res.status(400).json({ message: "Title, description, location, and deadline are required" });
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements || "",
      location,
      tags: extractTags(req.body),
      salary,
      type,
      experience,
      deadline,
      company: req.user.company || req.user.firstname, // fallback if company wasn't set
      employer: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs  (public - browse-jobs page)
// Supports ?keyword=react&location=Bangalore&type=Full-time
export const getJobs = async (req, res, next) => {
  try {
    const { keyword, location, type } = req.query;

    const filter = { status: "active" };
    if (keyword) filter.$text = { $search: keyword };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (type) filter.type = type;

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/:id  (public - job-detail page)
// If the request carries a valid token for a seeker (optionalAuth), the
// response includes a skillMatch block computed against that seeker's profile.
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "employer",
      "firstname lastname company email industry companySize founded headquarters companyDescription"
    );
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    let skillMatch = null;
    if (req.user && req.user.role === "seeker") {
      skillMatch = computeSkillMatch(job.tags, req.user.skills);
    }

    res.status(200).json({ ...job.toObject(), skillMatch });
  } catch (error) {
    next(error);
  }
};

// POST /api/jobs/:id/ai-match  (seeker only)
// On-demand, Groq-powered version of the skill match: a real short explanation
// and tip instead of just a percentage. Kept separate from GET /:id (which
// stays fast and free) since this makes an external API call.
// Always returns a usable result - if Groq isn't configured or the call
// fails for any reason, it silently falls back to the deterministic score
// so the "AI skill match" button never just shows an error to the user.
export const getAIJobMatch = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    try {
      const analysis = await getAISkillAnalysis({ job, user: req.user });
      return res.status(200).json({ ...analysis, source: "ai" });
    } catch (aiError) {
      console.error("Groq skill match failed, falling back to deterministic score:", aiError.message);
      const fallback = computeSkillMatch(job.tags, req.user.skills);
      return res.status(200).json({
        score: fallback?.score ?? 0,
        matchedSkills: fallback?.matchedSkills ?? [],
        missingSkills: fallback?.missingSkills ?? [],
        summary: "AI analysis is temporarily unavailable, showing a basic skill match instead.",
        tip: "Add more of the job's listed skills to your profile to improve this score.",
        source: "fallback",
      });
    }
  } catch (error) {
    next(error);
  }
};


export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

// PUT /api/jobs/:id  (employer only, must own the job)
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own job postings" });
    }

    const updatable = [
      "title",
      "description",
      "requirements",
      "location",
      "salary",
      "type",
      "experience",
      "deadline",
      "status",
    ];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });
    if (req.body.tags !== undefined || req.body.skills !== undefined) {
      job.tags = extractTags(req.body);
    }

    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/jobs/:id  (employer who owns it, or admin)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    const isOwner = job.employer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own job postings" });
    }

    await job.deleteOne();
    res.status(200).json({ message: "Job deleted" });
  } catch (error) {
    next(error);
  }
};
