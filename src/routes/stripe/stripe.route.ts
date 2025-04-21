import { raw, Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import bodyParser from "body-parser";
import {
	getAccountLink,
	createConnectAccount,
	createCustomerAccount,
	createSetupIntent,
	hasAccount,
	getCustomerPaymentMethods,
	getConnectedAccountBankAccounts,
	setCustomerDefaultPaymetMethod,
} from "../../controllers/stripe/stripe.controller.js";
import { handleStripeWebhook } from "../../controllers/stripe/stripe.webhook.controller.js";

const router = Router();

router.get("/account-link", requireAuth, getAccountLink);
router.get("/has-account", requireAuth, hasAccount);
router.get("/customer-payment-methods", requireAuth, getCustomerPaymentMethods);
router.get(
	"/connected-account-bank-accounts",
	requireAuth,
	getConnectedAccountBankAccounts
);
router.post("/webhook", raw({ type: "application/json" }), handleStripeWebhook);
router.post("/create-connect-account", requireAuth, createConnectAccount);
router.post("/create-customer-account", requireAuth, createCustomerAccount);
router.post(
	"/default-payment-method",
	requireAuth,
	setCustomerDefaultPaymetMethod
);
router.post("/setup-intent", requireAuth, createSetupIntent);

export default router;
