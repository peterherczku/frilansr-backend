import { NextFunction, Request, Response } from "express";

import * as messageService from "../../services/message.service.js";
import { getAuth } from "@clerk/express";

export async function getConversation(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const conversation = await messageService.getConversation(
			userId,
			req.query
		);
		res.status(200).json({ conversation });
	} catch (error) {
		next(error);
	}
}

export async function getRecentConversations(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const conversations = await messageService.getRecentConversations(
			userId,
			req.query
		);
		res.status(200).json({ conversations });
	} catch (error) {
		next(error);
	}
}

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

export async function sendSeen(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		await messageService.sendSeen(userId, req.body);
		res.status(200).json({ success: true });
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

export async function unseenMessages(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const count = await messageService.unseenMessagesCount(userId);
		res.status(200).json({ count });
	} catch (error) {
		next(error);
	}
}
