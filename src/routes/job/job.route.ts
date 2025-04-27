import { Router } from "express";
import jobIdRoutes from "./job.id.routes.js";
import { requireJobId } from "../../middlewares/jobIdMiddleware.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import {
	activeJobs,
	activeWorkerJobs,
	ongoingJobForWorker,
	recentJobsForWorker,
} from "../../controllers/job/job.controller.js";

const router = Router();

router.get("/ongoing-worker", requireAuth, ongoingJobForWorker);
router.get("/active-worker", requireAuth, activeWorkerJobs);
router.get("/recent-jobs-worker", requireAuth, recentJobsForWorker);
router.get("/active", requireAuth, activeJobs);
router.use("/:id", requireJobId, jobIdRoutes);

export default router;
