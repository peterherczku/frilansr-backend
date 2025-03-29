import { Request, Response, NextFunction, RequestHandler } from "express";
import * as listingService from "../services/listing.service.js";

export async function getListing(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		if (!req.query.id) {
			res.status(400).json({ message: "Listing ID is required" });
			return;
		}
		const listing = await listingService.getListing(req.query.id as string);
		if (!listing) {
			res.status(404).json({ message: "Listing not found" });
			return;
		}
		res.status(201).json({ listing });
	} catch (error) {
		next(error);
	}
}
