import { Request, Response, NextFunction, RequestHandler } from "express";
import * as listingService from "../../services/listing.service.js";
import { updateListingSchema } from "../../lib/validators.js";
import { getAuth } from "@clerk/express";

export async function getListing(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const listing = await listingService.getListing(req.params["id"]);
		res.status(201).json({ listing });
	} catch (error) {
		next(error);
	}
}

export async function updateListing(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const listingId = req.params["id"];
		const listing = await listingService.updateListing(
			userId,
			listingId,
			req.body
		);
		res.status(201).json({ listing });
	} catch (error) {
		next(error);
	}
}

export async function publishListing(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const listingId = req.params["id"];
		const listing = await listingService.publishListing(userId, listingId);
		res.status(201).json({ listing });
	} catch (error) {
		next(error);
	}
}
