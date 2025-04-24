import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";

import * as jobService from "../../services/job.service.js";

export async function activeJobs(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const jobs = await jobService.getActiveJobs(userId);
		res.status(200).json(jobs);
	} catch (error) {
		next(error);
	}
}

export async function activeWorkerJobs(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const jobs = await jobService.getActiveWorkerJobs(userId);
		res.status(200).json(jobs);
	} catch (error) {
		next(error);
	}
}

export async function ongoingJobForWorker(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const result = await jobService.getOngoingJob(userId);
	} catch (error) {
		next(error);
	}
}
