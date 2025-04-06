import { clerkClient } from "@clerk/express";
import { AppError } from "../lib/error.js";
import { updateUserRoleSchema } from "../lib/validators.js";

export async function updateRole(userId: string, data: any) {
	const result = updateUserRoleSchema.safeParse(data);
	if (!result.success) {
		if (result.error.issues[0]) {
			throw new AppError(result.error.issues[0].message, 400);
		} else {
			throw new AppError("Invalid data", 400);
		}
	}
	await clerkClient.users.updateUserMetadata(userId, {
		publicMetadata: {
			role: result.data.role,
		},
	});
	return true;
}
