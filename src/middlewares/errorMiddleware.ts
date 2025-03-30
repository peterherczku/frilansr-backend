import { Request, Response, NextFunction } from "express";

export function errorHandler(
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) {
	const status = err.status || 500;
	const message = err.message || "Something went wrong";

	res.status(status).json({
		success: false,
		error: {
			message,
		},
	});
}
