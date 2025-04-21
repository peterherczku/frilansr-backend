import { clerkClient } from "@clerk/express";
import { AppError } from "../lib/error.js";
import { stripe } from "../lib/stripe.js";
import { Payments } from "../models/payments.js";

// for worker - connect bc connecting bank account
export async function createConnectAccount(userId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "WORKER") {
		throw new AppError("You are not a worker", 403);
	}
	if (await Payments.getConnectAccountId(userId)) {
		throw new AppError("You already have a connected account", 400);
	}
	const account = await stripe.accounts.create({
		type: "express",
		country: "SE",
		email: user.emailAddresses[0]?.emailAddress,
		capabilities: {
			card_payments: {
				requested: true,
			},
			transfers: {
				requested: true,
			},
		},
	});
	await Payments.createConnectAccount(userId, account.id);
	return { accountId: account.id };
}

// for job lister - customer because he gets charged
export async function createCustomerAccount(userId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "LISTER") {
		throw new AppError("You are not a lister", 403);
	}
	if (await Payments.getCustomerAccountId(userId)) {
		throw new AppError("You already have a customer account", 400);
	}
	const customer = await stripe.customers.create({
		email: user.emailAddresses[0]?.emailAddress,
	});
	await Payments.createCustomerAccount(userId, customer.id);
	return { customerId: customer.id };
}

export async function createSetupIntent(userId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "LISTER") {
		throw new AppError("You are not a lister", 403);
	}
	const stripeId = await Payments.getCustomerAccountId(userId);
	if (!stripeId) {
		throw new AppError("You don't have a connected account", 400);
	}
	const setupIntent = await stripe.setupIntents.create({
		customer: stripeId,
		usage: "off_session",
		payment_method_types: ["card"],
	});
	return { clientSecret: setupIntent.client_secret };
}

// for worker - connect bc connecting bank account
export async function getAccountLink(userId: string) {
	const stripeId = await Payments.getConnectAccountId(userId);
	if (!stripeId) {
		throw new AppError("You don't have a connected account", 400);
	}
	const accountLink = await stripe.accountLinks.create({
		account: stripeId,
		refresh_url: `${process.env.FRONTEND_URL}/settings/payments`,
		return_url: `${process.env.FRONTEND_URL}/settings/payments`,
		type: "account_onboarding",
	});
	return { url: accountLink.url };
}

// for job lister - customer because he gets charged
export async function getCustomerPaymentMethods(userId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "LISTER") {
		throw new AppError("You are not a lister", 403);
	}
	const stripeId = await Payments.getCustomerAccountId(userId);
	if (!stripeId) {
		throw new AppError("You don't have a connected account", 400);
	}
	const paymentMethods = await stripe.paymentMethods.list({
		customer: stripeId,
		type: "card",
	});
	const safe = paymentMethods.data.map((pm) => ({
		id: pm.id,
		brand: pm.card.brand,
		last4: pm.card.last4,
		exp_month: pm.card.exp_month,
		exp_year: pm.card.exp_year,
	}));
	return { paymentMethods: safe };
}

export async function hasAccount(userId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role === "LISTER") {
		const stripeID = await Payments.getCustomerAccountId(userId);
		return { hasAccount: !!stripeID };
	}
	if (user.publicMetadata.role === "WORKER") {
		const stripeID = await Payments.getConnectAccountId(userId);
		return { hasAccount: !!stripeID };
	}
	return { hasAccount: false };
}
