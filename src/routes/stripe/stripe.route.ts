import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import {
	getAccountLink,
	createConnectAccount,
	createCustomerAccount,
	createSetupIntent,
} from "../../controllers/stripe/stripe.controller.js";

const router = Router();

router.get("/account-link", requireAuth, getAccountLink);
router.post("/create-connect-account", requireAuth, createConnectAccount);
router.post("/create-customer-account", requireAuth, createCustomerAccount);
router.post("/setup-intent", requireAuth, createSetupIntent);

export default router;
