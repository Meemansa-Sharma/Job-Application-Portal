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


router.get("/", getJobs);


router.get("/employer/mine", protect, authorize("employer"), getMyJobs);

router.get("/:id", optionalAuth, getJobById);

router.post("/:id/ai-match", protect, authorize("seeker"), getAIJobMatch);


router.post("/", protect, authorize("employer"), createJob);
router.put("/:id", protect, authorize("employer"), updateJob);
router.delete("/:id", protect, authorize("employer", "admin"), deleteJob);

export default router;
