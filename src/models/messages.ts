import { ably } from "../lib/ably.js";
import { prisma } from "../lib/prisma.js";

const Messages = {
	async createConversation(workerId: string, listerId: string, jobId: string) {
		return await prisma.conversation.create({
			data: {
				workerId,
				listerId,
				jobId,
			},
		});
	},
	async getConversation(conversationId: string) {
		return await prisma.conversation.findFirst({
			where: {
				id: conversationId,
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
				OR: [
					{
						workerId: userId,
					},
					{
						listerId: userId,
					},
				],
			},
			orderBy: {
				updatedAt: "desc",
			},
			include: {
				lastMessage: true,
			},
			skip: (page - 1) * limit,
			take: limit,
		});
	},
	async getAllConversationIds(userId: string) {
		const conversations = await prisma.conversation.findMany({
			where: {
				OR: [
					{
						workerId: userId,
					},
					{
						listerId: userId,
					},
				],
			},
			select: {
				id: true,
			},
		});
		return conversations.map((conversation) => conversation.id);
	},
	async notifiyUsersAboutConversation(
		userIds: string[],
		conversationId: string
	) {
		for (const userId of userIds) {
			const channel = ably.channels.get(`user:${userId}`);
			channel.publish("new-conversation", {
				conversationId,
			});
		}
	},
};

export { Messages };
