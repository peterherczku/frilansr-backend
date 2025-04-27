import { prisma } from "../lib/prisma.js";

const Jobs = {
	async getJob(jobId) {
		return await prisma.job.findFirst({
			where: {
				id: jobId,
			},
			include: {
				listing: true,
			},
		});
	},
	async getJobWithTransaction(jobId) {
		return await prisma.job.findFirst({
			where: {
				id: jobId,
			},
			include: {
				listing: true,
				transaction: true,
			},
		});
	},
	async activeJobs(userId: string) {
		return await prisma.job.findMany({
			where: {
				listing: {
					userId: userId,
				},
				OR: [
					{
						status: "WAITING_FOR_WORKER",
					},
					{
						status: "IN_PROGRESS",
					},
				],
			},
			include: {
				listing: true,
			},
		});
	},
	async activeWorkerJobs(userId: string) {
		return await prisma.job.findMany({
			where: {
				workerId: userId,
			},
			include: {
				listing: true,
			},
		});
	},
	async startJob(jobId: string) {
		return await prisma.job.update({
			where: {
				id: jobId,
			},
			data: {
				status: "IN_PROGRESS",
				startTime: new Date(),
			},
			include: {
				listing: true,
			},
		});
	},
	async stopJob(jobId: string) {
		return await prisma.job.update({
			where: {
				id: jobId,
			},
			data: {
				stopTime: new Date(),
				status: "COMPLETED",
			},
			include: {
				listing: true,
			},
		});
	},
	async getOngoingJobForWorker(userId: string) {
		return await prisma.job.findFirst({
			where: {
				workerId: userId,
				status: "IN_PROGRESS",
			},
			include: {
				listing: true,
			},
		});
	},
	async getRecentJobsForWorker(userId: string) {
		return await prisma.job.findMany({
			where: {
				workerId: userId,
				status: "COMPLETED",
			},
			include: {
				listing: true,
			},
			orderBy: {
				stopTime: "desc",
			},
			take: 3,
		});
	},
};

export { Jobs };
