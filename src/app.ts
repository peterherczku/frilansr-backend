import "dotenv/config";
import express from "express";
import routes from "./routes/index.js";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { handleStripeWebhook } from "./controllers/stripe/stripe.webhook.controller.js";

const app = express();

import { createClerkClient } from "@clerk/backend";
import { logHandler } from "./middlewares/loggingMiddleware.js";

const clerkClient = createClerkClient({
	secretKey: process.env.CLERK_SECRET_KEY,
	publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

app.post(
	"/api/stripe/webhook",
	express.raw({ type: "application/json" }),
	handleStripeWebhook
);
app.use(express.json());
app.use(clerkMiddleware({ clerkClient, debug: true, enableHandshake: true }));

app.use(logHandler);
app.use("/api", routes); // attach all routes
app.use(errorHandler);
export default app;
