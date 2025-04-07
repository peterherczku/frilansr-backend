import { Request, Response, NextFunction } from "express";

export function logHandler(req: Request, res: Response, next: NextFunction) {
	const { method, originalUrl } = req;
	res.on("finish", () => {
		const { statusCode } = res;
		console.log(`${method} ${originalUrl} ${statusCode}`);
	});
	next();
}
