import { prisma } from "../lib/prisma.js";

export const Payments = {
	async getCustomerAccountId(userId: string) {
		const stripeAccount = await prisma.stripeAccount.findFirst({
			where: {
				userId,
			},
		});
		return stripeAccount?.stripeCustomerId || null;
	},
	async getConnectAccountId(userId: string) {
		const stripeAccount = await prisma.stripeAccount.findFirst({
			where: {
				userId,
			},
		});
		return stripeAccount?.stripeAccountId || null;
	},
	async createConnectAccount(userId: string, stripeAccountId: string) {
		return await prisma.stripeAccount.create({
			data: {
				userId,
				stripeAccountId,
			},
		});
	},
	async createCustomerAccount(userId: string, stripeCustomerId: string) {
		return await prisma.stripeAccount.create({
			data: {
				userId,
				stripeCustomerId,
			},
		});
	},
};
