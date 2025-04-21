import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";

import * as stripeService from "../../services/stripe.service.js";

export async function createConnectAccount(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const accountId = await stripeService.createConnectAccount(userId);
		res.status(201).json(accountId);
	} catch (error) {
		next(error);
	}
}

export async function createCustomerAccount(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const customerId = await stripeService.createCustomerAccount(userId);
		res.status(201).json(customerId);
	} catch (error) {
		next(error);
	}
}

export async function getAccountLink(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const url = await stripeService.getAccountLink(userId);
		res.status(201).json(url);
	} catch (error) {
		next(error);
	}
}

export async function createSetupIntent(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const clientSecret = await stripeService.createSetupIntent(userId);
		res.status(201).json(clientSecret);
	} catch (error) {
		next(error);
	}
}

export async function hasAccount(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const hasAccount = await stripeService.hasAccount(userId);
		res.status(200).json(hasAccount);
	} catch (error) {
		next(error);
	}
}

export async function getCustomerPaymentMethods(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const paymentMethods = await stripeService.getCustomerPaymentMethods(
			userId
		);
		res.status(200).json(paymentMethods);
	} catch (error) {
		next(error);
	}
}

export async function getConnectedAccountBankAccounts(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const bankAccounts = await stripeService.getConnectedAccountBankAccounts(
			userId
		);
		res.status(200).json(bankAccounts);
	} catch (error) {
		next(error);
	}
}

export async function setCustomerDefaultPaymetMethod(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const customerId = await stripeService.setCustomerDefaultPaymentMethod(
			userId,
			req.body
		);
		res.status(200).json(customerId);
	} catch (error) {
		next(error);
	}
}
