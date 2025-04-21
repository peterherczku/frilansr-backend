import { TransactionStatus } from "@prisma/client";
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
		return await prisma.stripeAccount.upsert({
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
	},
	async createCustomerAccount(userId: string, stripeCustomerId: string) {
		return await prisma.stripeAccount.upsert({
			where: {
				userId,
			},
			update: {
				stripeCustomerId,
			},
			create: {
				userId,
				stripeCustomerId,
			},
		});
	},
	async createTransaction(
		jobId: string,
		workerId: string,
		listerId: string,
		stripePaymentIntentId: string,
		amount: number
	) {
		return await prisma.transaction.create({
			data: {
				jobId,
				workerId,
				listerId,
				stripePaymentIntentId,
				amount,
			},
		});
	},
	async updateTransactionStatus(
		paymentIntentId: string,
		status: TransactionStatus
	) {
		return await prisma.transaction.update({
			where: {
				stripePaymentIntentId: paymentIntentId,
			},
			data: {
				status,
			},
		});
	},
};
