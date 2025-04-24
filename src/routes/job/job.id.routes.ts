import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import { getJob, startJob } from "../../controllers/job/job.id.controller.js";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, getJob);
router.post("/start", requireAuth, startJob);

export default router;
