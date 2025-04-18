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
	async activeJobs(userId: string) {
		return await prisma.job.findMany({
			where: {
				listing: {
					userId: userId,
				},
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
};

export { Jobs };
