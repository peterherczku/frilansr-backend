import { clerkClient } from "@clerk/express";
import { AppError } from "../lib/error.js";
import { Job, Prisma } from "@prisma/client";
import { Jobs } from "../models/job.js";
import { extendWithUser, reduceListing } from "./listing.service.js";
import { diffInMilliseconds, FIVE_MINUTES_IN_MILLIS } from "../lib/dateUtil.js";
import { stripe } from "../lib/stripe.js";
import { Payments } from "../models/payments.js";

export type JobWithListing = Prisma.JobGetPayload<{
	include: { listing: true };
}>;

export type JobWithListingAndTransaction = Prisma.JobGetPayload<{
	include: { listing: true; transaction: true };
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

export async function startJob(userId: string, jobId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "WORKER") {
		throw new AppError("You are not a worker", 403);
	}
	const job = await Jobs.getJob(jobId);
	if (!job) {
		throw new AppError("Job not found", 404);
	}
	if (job.workerId !== userId) {
		throw new AppError("You are not authorized to start this job");
	}
	if (diffInMilliseconds(job.listing.date) > FIVE_MINUTES_IN_MILLIS) {
		throw new AppError(
			"You cannot start a work more then 5 minutes before the date of it."
		);
	}
	const rawRes = await Jobs.startJob(jobId);
	const jobWithUser = await getOngoingJobWithWorker(rawRes);
	const listingWithUser = await reduceListing(rawRes.listing, false);
	return {
		...jobWithUser,
		listing: listingWithUser,
	};
}

export async function stopJob(userId: string, jobId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "WORKER") {
		throw new AppError("You are not a worker", 403);
	}
	const job = await Jobs.getJobWithTransaction(jobId);
	if (!job) {
		throw new AppError("Job not found", 404);
	}
	if (job.workerId !== userId) {
		throw new AppError("You are not authorized to start this job");
	}
	if (job.status !== "IN_PROGRESS") {
		throw new AppError("This job is not in progress!");
	}
	const durationInMillis = job.listing.duration * 1000;
	const expectedFinishDate = new Date(
		job.startTime.getTime() + durationInMillis
	);
	if (diffInMilliseconds(expectedFinishDate) >= FIVE_MINUTES_IN_MILLIS) {
		throw new AppError(
			"You cannot stop a job more than 5 minutes prior to its expected end."
		);
	}
	const rawRes = await Jobs.stopJob(jobId);
	await endJob(job);
	const jobWithUser = await getFinishedJobWithWorker(rawRes);
	const listingWithUser = await reduceListing(rawRes.listing, false);
	return {
		...jobWithUser,
		listing: listingWithUser,
	};
}

export async function getOngoingJob(userId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "WORKER") {
		throw new AppError("You are not a worker", 403);
	}
	const job = await Jobs.getOngoingJobForWorker(userId);
	if (!job) {
		return [];
	}
	const jobWithUser = await getOngoingJobWithWorker(job);
	const listingWithUser = await reduceListing(job.listing, false);
	const res = {
		...jobWithUser,
		listing: listingWithUser,
	};
	return [res];
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

export async function getOngoingJobWithWorker(job: Job) {
	const user = await clerkClient.users.getUser(job.workerId);
	return {
		id: job.id,
		status: job.status,
		createdAt: job.createdAt,
		updatedAt: job.updatedAt,
		startTime: job.startTime,
		worker: {
			id: user.id,
			name: user.fullName,
			imageUrl: user.imageUrl,
		},
	};
}

export async function getFinishedJobWithWorker(job: Job) {
	const user = await clerkClient.users.getUser(job.workerId);
	return {
		id: job.id,
		status: job.status,
		createdAt: job.createdAt,
		updatedAt: job.updatedAt,
		startTime: job.startTime,
		stopTime: job.stopTime,
		worker: {
			id: user.id,
			name: user.fullName,
			imageUrl: user.imageUrl,
		},
	};
}

async function endJob(job: JobWithListingAndTransaction) {
	// Fetch job with relations
	if (!job || !job.transaction.stripePaymentIntentId) {
		throw new Error("Missing data for payout");
	}
	// Retrieve the charge ID from PaymentIntent
	const paymentIntent = await stripe.paymentIntents.retrieve(
		job.transaction.stripePaymentIntentId,
		{
			expand: [
				"latest_charge.balance_transaction", // directly expand the balance transaction
				"latest_charge", // you don’t need "charges" if you only care about the latest
			],
		}
	);
	if (typeof paymentIntent.latest_charge === "string") {
		throw new Error("Charge not found");
	}
	const charge = paymentIntent.latest_charge;
	if (!charge) throw new Error("Charge not found on PaymentIntent");

	const workerStripeAccountId = await Payments.getConnectAccountId(
		job.workerId
	);
	if (typeof charge.balance_transaction === "string")
		throw new Error("Charge balance transaction not found");
	const stripeFee = charge.balance_transaction.fee;
	const amount = paymentIntent.amount;
	const feePercent = 0.025; // 2.5% fee
	const feeAmount = Math.round(amount * feePercent); // fee in cents
	const transferAmount = amount - feeAmount - stripeFee;

	// Create transfer to worker's account
	const transfer = await stripe.transfers.create({
		amount: transferAmount,
		currency: "sek",
		destination: workerStripeAccountId,
		transfer_group: `job_${job.id}`,
		source_transaction: charge.id,
	});
	await Payments.updateTransactionStatus(
		paymentIntent.id,
		"ON_WAY_TO_DESTINATION"
	);
}
