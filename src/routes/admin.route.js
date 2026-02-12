import { Router } from "express";

import { adminAuth } from "../middlewares/auth.middleware.js";

import adminController from "../controllers/admin.controller.js";

const router = Router();

router.get("/dashboard", adminAuth, adminController.getDashboard);
router.get("/usuarios", adminAuth, adminController.getUsuarios);
router.get("/permissions", adminAuth, adminController.getPermissions);

router.get("/api/getInfo", adminAuth, adminController.getUserInfo);

export default router;