import { ConversationParticipant, Prisma } from "@prisma/client";
import { ably } from "../lib/ably.js";
import { AppError } from "../lib/error.js";
import {
	getConversationSchema,
	getMessagesSchema,
	getRecentConversationsSchema,
	sendMessageSchema,
	sendSeenSchema,
} from "../lib/validators.js";
import { Messages } from "../models/messages.js";
import { clerkClient } from "@clerk/express";

export type ConversationWithLastMessage = Prisma.ConversationGetPayload<{
	include: { lastMessage: true };
}>;

export type ConversationWithLastMessageAndParticipants =
	Prisma.ConversationGetPayload<{
		include: { lastMessage: true; participants: true };
	}>;

export async function getConversation(userId: string, query: any) {
	const res = getConversationSchema.safeParse(query);
	if (!res.success) {
		throw new AppError("Invalid query", 400);
	}
	const { id } = res.data;
	const conversation = await Messages.getConversation(id);
	if (!conversation) {
		throw new AppError("Conversation not found", 404);
	}
	if (
		conversation.participants.find((p) => p.userId === userId) === undefined
	) {
		throw new AppError(
			"You are not authorized to send messages in this conversation",
			403
		);
	}
	const partnerParticipant = getPartnerParticipant(
		userId,
		conversation.participants
	);
	const partner = await getPartner(userId, conversation.participants);

	return {
		id: conversation.id,
		partner: {
			id: partner.id,
			name: partner.fullName,
			imageUrl: partner.imageUrl,
			...(partnerParticipant.lastSeenAt
				? { lastSeen: partnerParticipant.lastSeenAt }
				: {}),
		},
	};
}

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
	if (
		conversation.participants.find((p) => p.userId === userId) === undefined
	) {
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
		const recipients = conversation.participants.map((p) => p.userId);
		const uniqueRecipients = [...new Set(recipients)];

		uniqueRecipients.forEach((targetUserId) => {
			const channel = ably.channels.get(`user:${targetUserId}`);
			channel.publish("message", {
				conversationId,
				message: {
					id: message.id,
					senderId: userId,
					content,
					sentAt: message.sentAt,
				},
			});
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
	if (
		conversation.participants.find((p) => p.userId === userId) === undefined
	) {
		throw new AppError(
			"You are not authorized to send messages in this conversation",
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

export async function sendSeen(userId: string, body: any) {
	const res = sendSeenSchema.safeParse(body);
	if (!res.success) {
		console.log(JSON.stringify(body));
		throw new AppError("Invalid seen data", 400);
	}
	const { conversationId } = res.data;
	const conversation = await Messages.getConversation(conversationId);
	if (!conversation) {
		throw new AppError("Conversation not found", 404);
	}
	if (
		conversation.participants.find((p) => p.userId === userId) === undefined
	) {
		throw new AppError(
			"You are not authorized to send messages in this conversation",
			403
		);
	}
	const seenAt = await Messages.updateSeen(conversationId, userId);
	if (!seenAt) {
		throw new AppError("Failed to update seen", 502);
	}

	const partnerId = getPartnerId(userId, conversation.participants);
	const channel = ably.channels.get(`user:${partnerId}`);
	channel.publish("seen", {
		conversationId,
		seenAt: seenAt.toISOString(),
		userId,
	});
}

async function reduceConversation(
	userId: string,
	conversation: ConversationWithLastMessageAndParticipants
) {
	const partnerParticipant = getPartnerParticipant(
		userId,
		conversation.participants
	);
	const partner = await getPartner(userId, conversation.participants);

	return {
		id: conversation.id,
		updatedAt: conversation.updatedAt,
		partner: {
			id: partner.id,
			name: partner.fullName,
			imageUrl: partner.imageUrl,
			...(partnerParticipant.lastSeenAt
				? { lastSeen: partnerParticipant.lastSeenAt }
				: {}),
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

function getPartnerParticipant(
	userId: string,
	participants: ConversationParticipant[]
) {
	const partnerParticipant = participants.find((p) => p.userId !== userId);
	if (!partnerParticipant) {
		throw new AppError("Partner not found", 404);
	}
	return partnerParticipant;
}

async function getPartnerId(
	userId: string,
	participants: ConversationParticipant[]
) {
	const partnerParticipant = participants.find((p) => p.userId !== userId);
	const partnerId = partnerParticipant.userId ?? null;
	if (!partnerId) {
		throw new AppError("Partner not found", 404);
	}
	return partnerId;
}

async function getPartner(
	userId: string,
	participants: ConversationParticipant[]
) {
	const partnerId = await getPartnerId(userId, participants);
	const partner = await clerkClient.users.getUser(partnerId);
	if (!partner) {
		throw new AppError("Partner not found", 404);
	}
	return partner;
}
