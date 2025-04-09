import { Router } from "express";
import listingRoutes from "./listing/listing.route.js";
import userRoutes from "./user/user.route.js";
import jobRoutes from "./job/job.route.js";

const router = Router();

router.use("/listings", listingRoutes);
router.use("/users", userRoutes);
router.use("/jobs", jobRoutes);

export default router;
