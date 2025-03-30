import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";

export function requireListingId(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const id = req.params["id"];
	if (!id) {
		res.status(400).json({ message: "Listing ID is required" });
		return;
	}
	next();
}
