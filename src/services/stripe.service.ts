import { clerkClient } from "@clerk/express";
import { AppError } from "../lib/error.js";
import { stripe } from "../lib/stripe.js";
import { Payments } from "../models/payments.js";
import Stripe from "stripe";
import { setCustomerDefaultPaymetMethodSchema } from "../lib/validators.js";

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
		refresh_url: `https://yourapp.com/stripe-refresh`,
		return_url: `https://yourapp.com/stripe-return`,
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
	const customer = (await stripe.customers.retrieve(stripeId, {
		expand: ["invoice_settings.default_payment_method"],
	})) as Stripe.Customer;

	const defaultPm =
		typeof customer.invoice_settings.default_payment_method === "string"
			? customer.invoice_settings.default_payment_method
			: customer.invoice_settings.default_payment_method?.id ?? null;

	const safe = paymentMethods.data.map((pm) => ({
		id: pm.id,
		brand: pm.card.brand,
		last4: pm.card.last4,
		exp_month: pm.card.exp_month,
		exp_year: pm.card.exp_year,
		isDefault: pm.id === defaultPm,
	}));

	return { paymentMethods: safe, defaultPaymentMethod: defaultPm };
}

export async function getConnectedAccountBankAccounts(userId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "WORKER") {
		throw new AppError("You are not a worker", 403);
	}
	const stripeId = await Payments.getConnectAccountId(userId);
	if (!stripeId) {
		throw new AppError("You don't have a connected account", 400);
	}
	const bankAccounts = await stripe.accounts.listExternalAccounts(stripeId, {
		object: "bank_account",
	});
	const safe = bankAccounts.data.map((ba: Stripe.BankAccount) => ({
		id: ba.id,
		bank: ba.bank_name,
		last4: ba.last4,
		country: ba.country,
		currency: ba.currency,
		default_for_currency: ba.default_for_currency,
	}));
	return { bankAccounts: safe };
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

export async function setCustomerDefaultPaymentMethod(
	userId: string,
	body: any
) {
	const res = setCustomerDefaultPaymetMethodSchema.safeParse(body);
	if (!res.success) {
		throw new AppError("Invalid request", 400);
	}
	const { paymentMethodId } = res.data;
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "LISTER") {
		throw new AppError("You are not a lister", 403);
	}
	const stripeId = await Payments.getCustomerAccountId(userId);
	if (!stripeId) {
		throw new AppError("You don't have a connected account", 400);
	}
	const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
	if (paymentMethod.customer !== stripeId) {
		throw new AppError("Payment method does not belong to customer", 403);
	}
	await stripe.customers.update(stripeId, {
		invoice_settings: { default_payment_method: paymentMethodId },
	});
	return { success: true };
}

export async function getDefaultPaymentMethodId(stripeId: string) {
	const customer = (await stripe.customers.retrieve(stripeId, {
		expand: ["invoice_settings.default_payment_method"],
	})) as Stripe.Customer;
	const defaultPm =
		typeof customer.invoice_settings.default_payment_method === "string"
			? customer.invoice_settings.default_payment_method
			: customer.invoice_settings.default_payment_method?.id ?? null;
	if (!defaultPm) {
		throw new AppError("Default payment method not found", 404);
	}
	return defaultPm;
}

export async function getOutgoingPayments(userId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "LISTER") {
		throw new AppError("You are not a lister", 403);
	}
	const stripeId = await Payments.getCustomerAccountId(userId);
	if (!stripeId) {
		throw new AppError("You don't have a connected account", 400);
	}
	const transactions = await Payments.getTransactionsForLister(userId);
	if (!transactions) return [];

	const safe = transactions.map((transaction) => ({
		id: transaction.id,
		amount: transaction.amount,
		status: transaction.status,
		createdAt: transaction.createdAt,
	}));
	return { outgoingPayments: safe };
}

export async function getWorkerPaymentHistory(userId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "WORKER") {
		throw new AppError("You are not a lister", 403);
	}
	const stripeId = await Payments.getConnectAccountId(userId);
	if (!stripeId) {
		throw new AppError("You don't have a connected account", 400);
	}
	const savedTransactions = await Payments.getTransactionsForWorker(userId);
	const safe = savedTransactions.map((transaction) => ({
		id: transaction.id,
		amount: transaction.amount,
		status: transaction.status,
		createdAt: transaction.createdAt,
	}));
	return { paymentHistory: safe };
}
