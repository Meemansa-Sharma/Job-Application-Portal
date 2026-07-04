import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllJobsAdmin,
  getAllApplicationsAdmin,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Every route here is admin-only
router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/jobs", getAllJobsAdmin);
router.get("/applications", getAllApplicationsAdmin);

export default router;
