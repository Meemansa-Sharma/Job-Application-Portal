import express from "express";
import {
  updateProfile,
  uploadProfileResume,
  removeProfileResume,
  saveJob,
  unsaveJob,
  getSavedJobs,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Profile editing - any logged-in user (seeker or employer)
router.put("/me", protect, updateProfile);

// Resume - seeker only
router.post("/resume", protect, authorize("seeker"), upload.single("resume"), uploadProfileResume);
router.delete("/resume", protect, authorize("seeker"), removeProfileResume);

// Saved jobs - seeker only
router.get("/saved-jobs", protect, authorize("seeker"), getSavedJobs);
router.post("/saved-jobs/:jobId", protect, authorize("seeker"), saveJob);
router.delete("/saved-jobs/:jobId", protect, authorize("seeker"), unsaveJob);

export default router;
