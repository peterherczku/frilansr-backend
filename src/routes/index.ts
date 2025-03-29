import { Router } from "express";
import listingRoutes from "./listing.route.js";
import { requireAuth } from "@clerk/express";

const router = Router();

router.use("/listings", listingRoutes);

export default router;
