import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import {
	getAccountLink,
	createConnectAccount,
	createCustomerAccount,
	createSetupIntent,
	hasAccount,
} from "../../controllers/stripe/stripe.controller.js";

const router = Router();

router.get("/account-link", requireAuth, getAccountLink);
router.get("/has-account", requireAuth, hasAccount);
router.post("/create-connect-account", requireAuth, createConnectAccount);
router.post("/create-customer-account", requireAuth, createCustomerAccount);
router.post("/setup-intent", requireAuth, createSetupIntent);

export default router;
