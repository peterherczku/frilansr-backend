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
	getOutgoingPayments,
	getWorkerPaymentHistory,
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
router.get("/outgoing-payments", requireAuth, getOutgoingPayments);
router.get("/payment-history-worker", requireAuth, getWorkerPaymentHistory);
router.post("/create-connect-account", requireAuth, createConnectAccount);
router.post("/create-customer-account", requireAuth, createCustomerAccount);
router.post(
	"/default-payment-method",
	requireAuth,
	setCustomerDefaultPaymetMethod
);
router.post("/setup-intent", requireAuth, createSetupIntent);

export default router;
