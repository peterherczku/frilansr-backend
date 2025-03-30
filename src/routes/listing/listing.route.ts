import { Router } from "express";
import listingIdRoutes from "./id.routes.js";
import { createListing } from "../../controllers/listing/listing.controller.js";
import { requireListingId } from "../../middlewares/listingIdMiddleware.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = Router();

router.use("/:id", requireListingId, listingIdRoutes);
router.post("/create", requireAuth, createListing);

export default router;
