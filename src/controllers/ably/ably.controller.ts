import { NextFunction, Request, Response } from "express";

import * as ablyService from "../../services/ably.service.js";
import { getAuth } from "@clerk/express";
import { AppError } from "../../lib/error.js";

export async function retrieveAblyToken(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const conversationId = req.query.conversationId as string;
		const token = await ablyService.getAblyTokenForUser(userId, conversationId);
		res.status(200).json({ token });
	} catch (error) {
		next(error);
	}
}
