import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import * as jobService from "../../services/job.service.js";

export async function getJob(req: Request, res: Response, next: NextFunction) {
	try {
		const { userId } = getAuth(req);
		const jobId = req.params["id"];
		const job = await jobService.getJob(userId, jobId);
		res.status(200).json({ job });
	} catch (error) {
		next(error);
	}
}

export async function startJob(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const jobId = req.params["id"];
		const result = await jobService.startJob(userId, jobId);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
}
