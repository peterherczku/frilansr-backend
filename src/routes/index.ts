import { Router } from "express";
import listingRoutes from "./listing/listing.route.js";
import userRoutes from "./user/user.route.js";
import jobRoutes from "./job/job.route.js";
import ablyRoutes from "./ably/ably.route.js";
import messageRoutes from "./message/message.route.js";
import stripeRoutes from "./stripe/stripe.route.js";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "../lib/uploadthing.js";

const router = Router();

router.use(
	"/uploadthing",
	createRouteHandler({
		router: uploadRouter,
	})
);
router.use("/listings", listingRoutes);
router.use("/users", userRoutes);
router.use("/jobs", jobRoutes);
router.use("/ably", ablyRoutes);
router.use("/messages", messageRoutes);
router.use("/stripe", stripeRoutes);

export default router;
