import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import { updateRole } from "../../controllers/user/user.controller.js";

const router = Router();

router.post("/updateRole", requireAuth, updateRole);

export default router;
