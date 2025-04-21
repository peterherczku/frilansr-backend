import { NextFunction, Request, Response } from "express";
import { stripe } from "../../lib/stripe.js";
import Stripe from "stripe";
import { AppError } from "../../lib/error.js";

import * as stripeWebhookService from "../../services/stripe.webhook.service.js";

export async function handleStripeWebhook(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const sig = req.headers["stripe-signature"];

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			sig,
			process.env.STRIPE_WEBHOOK_SECRET_TEST
		);
	} catch (err) {
		throw new AppError("Webhook Error", 400);
	}

	switch (event.type) {
		case "payment_intent.succeeded":
			const paymentIntent = event.data.object;
			await stripeWebhookService.updateTransactionStatus(
				paymentIntent.id,
				"ARRIVED_AT_FRILANSR"
			);
			break;
		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	res.json({ received: true });
}
