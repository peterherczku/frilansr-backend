import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/error.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const user = getAuth(req);
	if (!user.userId) {
		throw new AppError("Unauthorized", 401);
	}
	next();
}
