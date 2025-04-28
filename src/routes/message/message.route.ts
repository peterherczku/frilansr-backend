import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import {
	getConversation,
	getMessages,
	getRecentConversations,
	sendMessage,
	sendSeen,
	unseenMessages,
} from "../../controllers/message/message.controller.js";

const router = Router();

router.get("/conversation", requireAuth, getConversation);
router.get("/recent-conversations", requireAuth, getRecentConversations);
router.get("/unseen-count", requireAuth, unseenMessages);
router.post("/seen", requireAuth, sendSeen);
router.post("/", requireAuth, sendMessage);
router.get("/", requireAuth, getMessages);

export default router;
