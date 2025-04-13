import { Router } from "express";
import listingRoutes from "./listing/listing.route.js";
import userRoutes from "./user/user.route.js";
import jobRoutes from "./job/job.route.js";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "../lib/uploadthing.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(
	"/uploadthing",
	requireAuth,
	createRouteHandler({
		router: uploadRouter,
	})
);
router.use("/listings", listingRoutes);
router.use("/users", userRoutes);
router.use("/jobs", jobRoutes);

export default router;
