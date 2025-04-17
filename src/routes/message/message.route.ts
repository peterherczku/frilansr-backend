import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import {
	getConversation,
	getMessages,
	getRecentConversations,
	sendMessage,
} from "../../controllers/message/message.controller.js";

const router = Router();

router.get("/conversation", requireAuth, getConversation);
router.get("/recent-conversations", requireAuth, getRecentConversations);
router.post("/", requireAuth, sendMessage);
router.get("/", requireAuth, getMessages);

export default router;
