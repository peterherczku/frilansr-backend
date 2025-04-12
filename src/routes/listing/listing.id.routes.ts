import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import {
	applyForListing,
	getApplications,
	getListing,
	publishListing,
	selectApplication,
	updateListing,
} from "../../controllers/listing/listing.id.controller.js";

const router = Router({ mergeParams: true });

router.get("/", getListing);
router.post("/update", requireAuth, updateListing);
router.post("/publish", requireAuth, publishListing);
router.post("/apply", requireAuth, applyForListing);
router.post("/select-application", requireAuth, selectApplication);
router.get("/applications", requireAuth, getApplications);

export default router;
