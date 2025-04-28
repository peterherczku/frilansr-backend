import { Conversation, Message } from "@prisma/client";
import { ably } from "../lib/ably.js";
import { prisma } from "../lib/prisma.js";

const Messages = {
	async createConversation(workerId: string, listerId: string, jobId: string) {
		return await prisma.conversation.create({
			data: {
				jobId, // link to your existing Job
				participants: {
					create: [{ userId: workerId }, { userId: listerId }],
				},
			},
			include: {
				participants: true,
			},
		});
	},
	async getConversation(conversationId: string) {
		return await prisma.conversation.findFirst({
			where: {
				id: conversationId,
			},
			include: {
				participants: true,
			},
		});
	},
	async createMessage(
		conversationId: string,
		senderId: string,
		content: string
	) {
		const msg = await prisma.message.create({
			data: {
				conversationId,
				senderId,
				content,
			},
		});
		await prisma.conversation.update({
			where: {
				id: conversationId,
			},
			data: {
				lastMessageId: msg.id,
			},
		});
		return msg;
	},
	async getMessages(conversationId: string, limit: number, before: Date) {
		const messages = await prisma.message.findMany({
			where: {
				conversationId,
				sentAt: {
					lt: before,
				},
			},
			orderBy: {
				sentAt: "desc",
			},
			take: limit,
		});
		return messages;
	},
	async getConversations(userId: string, limit: number, page: number) {
		return await prisma.conversation.findMany({
			where: {
				participants: {
					some: { userId },
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
			include: {
				lastMessage: true,
				participants: true,
			},
			skip: (page - 1) * limit,
			take: limit,
		});
	},
	async getAllConversationIds(userId: string) {
		const conversations = await prisma.conversation.findMany({
			where: {
				participants: {
					some: { userId },
				},
			},
			select: {
				id: true,
			},
		});
		return conversations.map((conversation) => conversation.id);
	},
	async notifyUsersAboutConversation(
		worker: {
			id: string;
			name: string;
			imageUrl: string;
			lastSeenAt?: Date;
		},
		lister: {
			id: string;
			name: string;
			imageUrl: string;
			lastSeenAt?: Date;
		},
		conversation: Conversation,
		message: Message
	) {
		for (let i = 0; i < 2; i++) {
			const userId = i === 0 ? worker.id : lister.id;
			const channel = ably.channels.get(`user:${userId}`);
			const partner = i === 0 ? lister : worker;
			channel.publish("new-conversation", {
				conversation: {
					id: conversation.id,
					partner,
				},
				message: {
					id: message.id,
					content: message.content,
					sentAt: message.sentAt,
					senderId: message.senderId,
				},
			});
		}
	},
	async updateSeen(userId: string, conversationId: string) {
		const seenAt = new Date();
		await prisma.conversationParticipant.update({
			where: {
				userId_conversationId: {
					userId: userId,
					conversationId: conversationId,
				},
			},
			data: {
				lastSeenAt: seenAt,
			},
		});
		return seenAt;
	},
	async getUnseenMessagesCount(userId: string) {
		const parts = await prisma.conversationParticipant.findMany({
			where: {
				userId,
				conversation: {
					status: "ACTIVE",
				},
			},
			select: {
				conversationId: true,
				lastSeenAt: true,
			},
		});

		const counts = await Promise.all(
			parts.map(({ conversationId, lastSeenAt }) =>
				prisma.message.count({
					where: {
						conversationId,
						senderId: { not: userId },
						sentAt: { gt: lastSeenAt ?? new Date(0) },
					},
				})
			)
		);

		return counts.reduce((sum, c) => sum + c, 0);
	},
};

export { Messages };
