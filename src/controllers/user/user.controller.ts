import { NextFunction, Request, Response } from "express";
import * as userService from "../../services/user.service.js";
import { getAuth } from "@clerk/express";

export async function updateRole(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { userId } = getAuth(req);
		const success = await userService.updateRole(userId, req.body);
		res.status(201).json({ success });
	} catch (error) {
		next(error);
	}
}
