import { prisma } from "../lib/prisma.js";

export const Payments = {
	async getStripeId(userId: string) {
		const stripeAccount = await prisma.stripeAccount.findFirst({
			where: {
				userId,
			},
		});
		if (!stripeAccount) return null;
		if (!stripeAccount.stripeAccountId && stripeAccount.stripeCustomerId)
			return stripeAccount.stripeCustomerId;
		return stripeAccount.stripeAccountId;
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
