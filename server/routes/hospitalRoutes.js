import { Router } from "express";
import { createHospital, deleteHospital, listHospitals } from "../controllers/hospitalController.js";
import { requireAuth } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
const router = Router();
router.get("/", listHospitals);
router.post("/", requireAuth, requireRole("admin"), createHospital);
router.delete("/:id", requireAuth, requireRole("admin"), deleteHospital);
export default router;
