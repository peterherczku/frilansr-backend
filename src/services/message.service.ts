import { ably } from "../lib/ably.js";
import { AppError } from "../lib/error.js";
import { getMessagesSchema, sendMessageSchema } from "../lib/validators.js";
import { Messages } from "../models/messages.js";

export async function sendMessage(userId: string, body: any) {
	const res = sendMessageSchema.safeParse(body);
	if (!res.success) {
		throw new AppError("Invalid message data", 400);
	}
	const { conversationId, content } = res.data;
	const conversation = await Messages.getConversation(conversationId);
	if (!conversation) {
		throw new AppError("Conversation not found", 404);
	}
	if (conversation.workerId !== userId && conversation.listerId !== userId) {
		throw new AppError(
			"You are not authorized to send messages in this conversation",
			403
		);
	}
	const message = await Messages.createMessage(conversationId, userId, content);
	if (!message) {
		throw new AppError("Failed to send message", 502);
	}
	try {
		const channelClient = ably.channels.get(conversationId);
		await channelClient.publish("message", {
			id: message.id,
			senderId: userId,
			content,
		});
	} catch (err) {
		console.log("Ably push error: ", err);
		throw new AppError("Failed to send message to Ably", 502);
	}
}

export async function getMessages(userId: string, query: any) {
	const result = getMessagesSchema.safeParse(query);
	if (!result.success) {
		throw new AppError("Invalid query", 400);
	}
	const { conversationId, limit, before } = result.data;
	const conversation = await Messages.getConversation(conversationId);
	if (!conversation) {
		throw new AppError("Conversation not found", 404);
	}
	if (conversation.workerId !== userId && conversation.listerId !== userId) {
		throw new AppError(
			"You are not authorized to view messages in this conversation",
			403
		);
	}
	const messages = await Messages.getMessages(conversationId, limit, before);

	return {
		messages: messages.reverse(),
		nextCursor: messages.length > 0 ? messages[0].sentAt : null,
		hasMore: messages.length === limit,
	};
}
