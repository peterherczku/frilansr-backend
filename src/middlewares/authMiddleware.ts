import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const { userId } = getAuth(req);
	if (!userId) {
		res.status(401).json({ message: "Unauthorized" });
		return;
	}
	next();
}
