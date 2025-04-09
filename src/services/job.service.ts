import { clerkClient } from "@clerk/express";
import { AppError } from "../lib/error.js";
import { Job } from "@prisma/client";
import { Jobs } from "../models/job.js";
import { reduceListing } from "./listing.service.js";

export async function getJob(userId: string, jobId: string) {
	const job = await Jobs.getJob(jobId);
	if (!job) throw new AppError("Job not found", 404);
	if (job.listing.userId !== userId || job.workerId !== userId) {
		throw new AppError("You are not authorized to view this job", 403);
	}
	const jobWithUser = await reduceJob(job);
	const listingWithUser = await reduceListing(job.listing);
	return {
		...jobWithUser,
		listing: listingWithUser,
	};
}

export async function reduceJob(job: Job) {
	const user = await clerkClient.users.getUser(job.workerId);
	return {
		worker: {
			id: user.id,
			name: user.fullName,
			imageUrl: user.imageUrl,
		},
	};
}
