import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import {
	getListing,
	publishListing,
	updateListing,
} from "../../controllers/listing/listing.id.controller.js";

const router = Router({ mergeParams: true });

router.get("/", getListing);
router.post("/update", requireAuth, updateListing);
router.post("/publish", requireAuth, publishListing);

export default router;
