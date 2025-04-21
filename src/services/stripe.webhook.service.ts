import { TransactionStatus } from "@prisma/client";
import { Payments } from "../models/payments.js";

export async function updateTransactionStatus(
	paymentIntentId: string,
	status: TransactionStatus
) {
	await Payments.updateTransactionStatus(paymentIntentId, status);
	return { success: true };
}
