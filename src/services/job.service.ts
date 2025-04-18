import { clerkClient } from "@clerk/express";
import { AppError } from "../lib/error.js";
import { Job, Prisma } from "@prisma/client";
import { Jobs } from "../models/job.js";
import { extendWithUser, reduceListing } from "./listing.service.js";

export type JobWithListing = Prisma.JobGetPayload<{
	include: { listing: true };
}>;

// private location
export async function getJob(userId: string, jobId: string) {
	const job = await Jobs.getJob(jobId);
	if (!job) throw new AppError("Job not found", 404);
	if (job.listing.userId !== userId || job.workerId !== userId) {
		throw new AppError("You are not authorized to view this job", 403);
	}
	const jobWithWorker = await getJobWithWorker(job);
	const listingWithUser = await reduceListing(job.listing, false);
	return {
		...jobWithWorker,
		listing: listingWithUser,
	};
}

// private location
export async function getActiveJobs(userId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "LISTER") {
		throw new AppError("You are not a job lister", 403);
	}
	const jobs = await Jobs.activeJobs(userId);
	if (!jobs) return [];

	return await extendJobs(jobs, false);
}

export async function getActiveWorkerJobs(userId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "WORKER") {
		throw new AppError("You are not a worker", 403);
	}
	const jobs = await Jobs.activeWorkerJobs(userId);
	if (!jobs) return [];

	return await extendJobs(jobs, false);
}

export async function extendJobs(
	jobs: JobWithListing[],
	jitterLocation = true
) {
	return Promise.all(
		jobs.map(async (job) => {
			const jobWithWorker = await getJobWithWorker(job);
			const listingWithUser = await reduceListing(job.listing, jitterLocation);
			return {
				...jobWithWorker,
				listing: listingWithUser,
			};
		})
	);
}

export async function getJobWithWorker(job: Job) {
	const user = await clerkClient.users.getUser(job.workerId);
	return {
		id: job.id,
		status: job.status,
		createdAt: job.createdAt,
		updatedAt: job.updatedAt,
		worker: {
			id: user.id,
			name: user.fullName,
			imageUrl: user.imageUrl,
		},
	};
}
