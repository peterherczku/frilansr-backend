import { Router } from "express";
import listingRoutes from "./listing/listing.route.js";
import userRoutes from "./user/user.route.js";

const router = Router();

router.use("/listings", listingRoutes);
router.use("/users", userRoutes);

export default router;
