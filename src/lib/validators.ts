import { z } from "zod";

const jobTypeEnum = z
	.enum(["DOG_WALKING"], {
		message: "Invalid job type",
	})
	.optional();

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
	image: z.string().optional(),
});
