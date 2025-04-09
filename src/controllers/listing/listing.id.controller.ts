import { Request, Response, NextFunction, RequestHandler } from "express";
import * as listingService from "../../services/listing.service.js";
import { getAuth } from "@clerk/express";

export async function getListing(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const listing = await listingService.getListing(req.params["id"]);
		res.status(200).json({ listing });
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

export async function applyForListing(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const listingId = req.params["id"];
		const success = await listingService.applyForListing(
			userId,
			listingId,
			req.body
		);
		res.status(201).json({ success });
	} catch (error) {
		next(error);
	}
}

export async function getApplications(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const applications = await listingService.getApplications(
			userId,
			req.params["id"]
		);
		res.status(200).json({ applications });
	} catch (error) {
		next(error);
	}
}

export async function selectApplication(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const listingId = req.params["id"];
		const job = await listingService.selectApplication(
			userId,
			listingId,
			req.body
		);
		res.status(201).json({ job });
	} catch (error) {
		next(error);
	}
}
