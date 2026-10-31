import { Router } from "express";
import { listUsers, updateUserRole } from "../controllers/userController.js";
import { requireAuth } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
const router = Router();
router.get("/", requireAuth, requireRole("admin"), listUsers);
router.patch("/:id/role", requireAuth, requireRole("admin"), updateUserRole);
export default router;
