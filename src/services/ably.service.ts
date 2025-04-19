import { ably } from "../lib/ably.js";
import { AppError } from "../lib/error.js";
import { Messages } from "../models/messages.js";

export async function getAblyTokenForUser(userId: string) {
	const capability = {};
	capability[`user:${userId}`] = ["subscribe"];
	const conversationIds = await Messages.getAllConversationIds(userId);
	for (const conversationId of conversationIds) {
		capability[`conversation:${conversationId}`] = ["publish", "subscribe"];
	}
	const tokenParams = {
		clientId: userId,
		capability: capability,
	};
	try {
		const tokenRequest = await ably.auth.createTokenRequest(tokenParams);
		return tokenRequest;
	} catch (err) {
		console.error("Ably token error:", err);
		throw new AppError("Failed to create token", 500);
	}
}

/*export async function getAblyTokenForUser(
	userId: string,
	conversationId: string
) {
	if (!conversationId) {
		throw new AppError("Missing channel name", 400);
	}

	const conversation = await Messages.getConversation(conversationId);
	if (!conversation) {
		throw new AppError("Conversation not found", 404);
	}
	if (conversation.workerId !== userId && conversation.listerId !== userId) {
		throw new AppError(
			"You are not authorized to access this conversation",
			403
		);
	}

	const tokenParams = {
		clientId: userId,
		capability: {},
	};
	tokenParams.capability[conversationId] = ["publish", "subscribe"];
	try {
		const tokenRequest = await ably.auth.createTokenRequest(tokenParams);
		return tokenRequest;
	} catch (err) {
		console.error("Ably token error:", err);
		throw new AppError("Failed to create token", 500);
	}
}*/
