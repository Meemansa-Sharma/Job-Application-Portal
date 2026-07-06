import express from "express";
import {
  applyToJob,
  getMyApplications,
  withdrawApplication,
  getApplicantsForJob,
  getAllApplicantsForEmployer,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Seeker views their own application history/status
router.get("/my", protect, authorize("seeker"), getMyApplications);

// Employer views every applicant across all of their own job postings

router.get("/employer/mine", protect, authorize("employer"), getAllApplicantsForEmployer);

// Employer views everyone who applied to one specific job of theirs
router.get("/job/:jobId", protect, authorize("employer"), getApplicantsForJob);

// Employer updates an application's status (review / interview / select / reject)
router.put("/:id/status", protect, authorize("employer"), updateApplicationStatus);

// Seeker withdraws their own application
router.delete("/:id", protect, authorize("seeker"), withdrawApplication);

// Seeker applies to a job, optionally uploading a resume file in the same
// request (falls back to their profile resume if none is attached)
router.post("/:jobId", protect, authorize("seeker"), upload.single("resume"), applyToJob);

export default router;
