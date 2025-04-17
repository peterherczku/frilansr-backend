import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import { retrieveAblyToken } from "../../controllers/ably/ably.controller.js";

const router = Router();

router.get("/auth", requireAuth, retrieveAblyToken);

export default router;
