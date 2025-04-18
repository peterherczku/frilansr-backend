import { Router } from "express";
import jobIdRoutes from "./job.id.routes.js";
import { requireJobId } from "../../middlewares/jobIdMiddleware.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/", requireAuth);
router.use("/:id", requireJobId, jobIdRoutes);

export default router;
