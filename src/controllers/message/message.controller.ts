import { NextFunction, Request, Response } from "express";

import * as messageService from "../../services/message.service.js";
import { getAuth } from "@clerk/express";

export async function sendMessage(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		await messageService.sendMessage(userId, req.body);
		res.status(200).json({ success: true, message: "Message sent" });
	} catch (error) {
		next(error);
	}
}

export async function getMessages(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const messages = await messageService.getMessages(userId, req.query);
		res.status(200).json(messages);
	} catch (error) {
		next(error);
	}
}
