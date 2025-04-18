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
		const listings = await jobService.getActiveJobs(userId);
		res.status(200).json(listings);
	} catch (error) {
		next(error);
	}
}
