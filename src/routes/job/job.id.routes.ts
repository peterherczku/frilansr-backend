import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import { getJob } from "../../controllers/job/job.id.controller.js";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, getJob);

export default router;
