import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import {
	getMessages,
	sendMessage,
} from "../../controllers/message/message.controller.js";

const router = Router();

router.post("/", requireAuth, sendMessage);
router.get("/", requireAuth, getMessages);

export default router;
