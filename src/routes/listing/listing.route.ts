import { Router } from "express";
import listingIdRoutes from "./listing.id.routes.js";
import {
	createListing,
	featuredListings,
	nearbyListings,
	searchListing,
} from "../../controllers/listing/listing.controller.js";
import { requireListingId } from "../../middlewares/listingIdMiddleware.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/search", searchListing);
router.get("/nearby", nearbyListings);
router.get("/featured", featuredListings);
router.post("/create", requireAuth, createListing);
router.use("/:id", requireListingId, listingIdRoutes);

export default router;
