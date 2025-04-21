import { prisma } from "../lib/prisma.js";

export const Payments = {
	async getCustomerAccountId(userId: string) {
		const stripeAccount = await prisma.stripeAccount.findFirst({
			where: {
				userId,
				stripeCustomerId: {
					not: null,
				},
			},
		});
		return stripeAccount?.stripeCustomerId || null;
	},
	async getConnectAccountId(userId: string) {
		const stripeAccount = await prisma.stripeAccount.findFirst({
			where: {
				userId,
				stripeAccountId: {
					not: null,
				},
			},
		});

		return stripeAccount?.stripeAccountId || null;
	},
	async createConnectAccount(userId: string, stripeAccountId: string) {
		await prisma.stripeAccount.upsert({
			where: {
				userId,
			},
			update: {
				stripeAccountId,
			},
			create: {
				userId,
				stripeAccountId,
			},
		});
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
