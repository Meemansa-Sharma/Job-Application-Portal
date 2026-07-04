import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  getAIJobMatch,
} from "../controllers/jobController.js";
import { protect, authorize, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getJobs);

// Specific/static paths MUST come before the "/:id" dynamic route below,
// otherwise Express would think "employer" is a job id.
router.get("/employer/mine", protect, authorize("employer"), getMyJobs);

// optionalAuth: public route, but attaches req.user if a valid token is
// present so a logged-in seeker gets a skillMatch score back.
router.get("/:id", optionalAuth, getJobById);

// On-demand AI-powered match analysis (Groq) - seeker only, since it needs their profile
router.post("/:id/ai-match", protect, authorize("seeker"), getAIJobMatch);

// Employer only
router.post("/", protect, authorize("employer"), createJob);
router.put("/:id", protect, authorize("employer"), updateJob);
router.delete("/:id", protect, authorize("employer", "admin"), deleteJob);

export default router;
