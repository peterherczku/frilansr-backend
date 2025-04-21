import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import {
	getAccountLink,
	createConnectAccount,
	createCustomerAccount,
	createSetupIntent,
	hasAccount,
	getCustomerPaymentMethods,
	getConnectedAccountBankAccounts,
} from "../../controllers/stripe/stripe.controller.js";

const router = Router();

router.get("/account-link", requireAuth, getAccountLink);
router.get("/has-account", requireAuth, hasAccount);
router.get("/customer-payment-methods", requireAuth, getCustomerPaymentMethods);
router.get(
	"/connected-account-bank-accounts",
	requireAuth,
	getConnectedAccountBankAccounts
);
router.post("/create-connect-account", requireAuth, createConnectAccount);
router.post("/create-customer-account", requireAuth, createCustomerAccount);
router.post("/setup-intent", requireAuth, createSetupIntent);

export default router;
