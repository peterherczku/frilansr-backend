import { z } from "zod";

const stringToIntegerSchema = z.string().transform((val, ctx) => {
	const num = parseFloat(val);
	if (isNaN(num)) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Invalid number",
		});
		return z.NEVER;
	}
	return num;
});

export const userRoleEnum = z.enum(["LISTER", "WORKER"], {
	message: "Invalid role",
});
export const jobTypeEnum = z
	.enum(["DOG_WALKING"], {
		message: "Invalid job type",
	})
	.optional();

export const applyForListingSchema = z.object({
	message: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
	role: userRoleEnum,
});

export const updateListingSchema = z.object({
	title: z
		.string()
		.min(4, {
			message: "Title must be at least 4 characters long",
		})
		.optional(),
	description: z
		.string()
		.min(10, {
			message: "Description must be at least 10 characters long",
		})
		.optional(),
	salary: z
		.number()
		.int({
			message: "Salary must be an integer",
		})
		.optional(),
	longitude: z.number().optional(),
	latitude: z.number().optional(),
	type: jobTypeEnum,
	duration: z
		.number()
		.int({
			message: "Duration must be an integer",
		})
		.optional(),
	date: z
		.preprocess(
			(arg) =>
				typeof arg === "string" || arg instanceof Date
					? new Date(arg)
					: undefined,
			z.date({ message: "Date must be a valid date" })
		)
		.optional(),
});

export const selectApplicationSchema = z.object({
	applicationId: z.string(),
});

export const sendMessageSchema = z.object({
	conversationId: z.string(),
	content: z.string(),
});

export const sendSeenSchema = z.object({
	conversationId: z.string(),
});

export const getMessagesSchema = z.object({
	conversationId: z.string(),
	limit: stringToIntegerSchema,
	before: z.preprocess(
		(arg) =>
			typeof arg === "string" || arg instanceof Date
				? new Date(arg)
				: undefined,
		z.date({ message: "Date must be a valid date" })
	),
});

export const getRecentConversationsSchema = z.object({
	limit: stringToIntegerSchema,
	page: stringToIntegerSchema,
});

export const getConversationSchema = z.object({
	id: z.string(),
});

export const setCustomerDefaultPaymetMethodSchema = z.object({
	paymentMethodId: z.string(),
});
