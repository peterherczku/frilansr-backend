import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import {
	getMessages,
	getRecentConversations,
	sendMessage,
} from "../../controllers/message/message.controller.js";

const router = Router();

router.get("/conversations", requireAuth, getRecentConversations);
router.post("/", requireAuth, sendMessage);
router.get("/", requireAuth, getMessages);

export default router;
