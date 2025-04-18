import { Router } from "express";
import jobIdRoutes from "./job.id.routes.js";
import { requireJobId } from "../../middlewares/jobIdMiddleware.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import { activeJobs } from "../../controllers/job/job.controller.js";

const router = Router();

router.get("/active", requireAuth, activeJobs);
router.use("/:id", requireJobId, jobIdRoutes);

export default router;
