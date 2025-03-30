import { NextFunction, Request, Response } from "express";

import * as listingService from "../../services/listing.service.js";
import { getAuth } from "@clerk/express";

export async function createListing(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const id = await listingService.createListing(userId);
		res.status(201).json({ id });
	} catch (error) {
		next(error);
	}
}
