import { Router } from "express";
import jobIdRoutes from "./job.id.routes.js";
import { requireJobId } from "../../middlewares/jobIdMiddleware.js";

const router = Router();

router.get("/");
router.use("/:id", requireJobId, jobIdRoutes);

export default router;
