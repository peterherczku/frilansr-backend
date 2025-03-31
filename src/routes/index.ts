import { Router } from "express";
import listingRoutes from "./listing/listing.route.js";

const router = Router();

router.use("/listings", listingRoutes);

export default router;
