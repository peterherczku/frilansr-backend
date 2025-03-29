import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { getListing } from "../controllers/listing.controller.js";

const router = Router();

router.get("/", getListing);

export default router;
