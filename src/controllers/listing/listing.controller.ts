import { NextFunction, Request, Response } from "express";

import * as listingService from "../../services/listing.service.js";
import { getAuth } from "@clerk/express";
import { AppError } from "../../lib/error.js";

export async function createListing(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const { created, draft } = await listingService.createListing(userId);
		if (created) {
			res.status(204).json({ created, draft });
		} else {
			res.status(201).json({ created, draft });
		}
	} catch (error) {
		next(error);
	}
}

export async function searchListing(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { category, query, limit, page } = req.query;
		if (!query || !limit || !page) throw new AppError("Missing query", 400);
		const listings = await listingService.searchListing(
			query as string,
			category as string | string[] | undefined,
			limit as string,
			page as string
		);
		res.status(200).json(listings);
	} catch (error) {
		next(error);
	}
}

export async function nearbyListings(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { latitude, longitude } = req.query;
		if (!latitude || !longitude)
			throw new AppError("Missing latitude or longitude", 400);
		const listings = await listingService.nearbyListings(
			latitude as string,
			longitude as string,
			10
		);
		res.status(200).json(listings);
	} catch (error) {
		next(error);
	}
}

export async function featuredListings(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const listings = await listingService.featuredListings();
		res.status(200).json(listings);
	} catch (error) {
		next(error);
	}
}
