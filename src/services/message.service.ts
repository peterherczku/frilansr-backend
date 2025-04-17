import { Prisma } from "@prisma/client";
import { ably } from "../lib/ably.js";
import { AppError } from "../lib/error.js";
import {
	getMessagesSchema,
	getRecentConversationsSchema,
	sendMessageSchema,
} from "../lib/validators.js";
import { Messages } from "../models/messages.js";
import { clerkClient } from "@clerk/express";

export type ConversationWithLastMessage = Prisma.ConversationGetPayload<{
	include: { lastMessage: true };
}>;

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

export async function getRecentConversations(userId: string, query: any) {
	const result = getRecentConversationsSchema.safeParse(query);
	if (!result.success) {
		throw new AppError("Invalid query", 400);
	}
	const { limit, page } = result.data;
	const conversations = await Messages.getConversations(userId, limit, page);
	if (!conversations) {
		return [];
	}

	const conversationsWithLastMessage = await Promise.all(
		conversations.map((c) => reduceConversation(userId, c))
	);
	return conversationsWithLastMessage;
}

async function reduceConversation(
	userId: string,
	conversation: ConversationWithLastMessage
) {
	const partnerId =
		userId === conversation.workerId
			? conversation.listerId
			: conversation.workerId;
	const partner = await clerkClient.users.getUser(partnerId);
	if (!partner) {
		throw new AppError("Partner not found", 404);
	}

	return {
		id: conversation.id,
		updatedAt: conversation.updatedAt,
		partner: {
			id: partner.id,
			name: partner.fullName,
			imageUrl: partner.imageUrl,
		},
		lastMessage: conversation.lastMessage
			? {
					id: conversation.lastMessage.id,
					senderId: conversation.lastMessage.senderId,
					content: conversation.lastMessage.content,
					sentAt: conversation.lastMessage.sentAt,
			  }
			: null,
	};
}
