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
		return await prisma.message.create({
			data: {
				conversationId,
				senderId,
				content,
			},
		});
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
};

export { Messages };
