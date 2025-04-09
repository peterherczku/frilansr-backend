import { NextFunction, Request, Response } from "express";

export function requireJobId(req: Request, res: Response, next: NextFunction) {
	const id = req.params["id"];
	if (!id) {
		res.status(400).json({ message: "Job ID is required" });
		return;
	}
	next();
}
