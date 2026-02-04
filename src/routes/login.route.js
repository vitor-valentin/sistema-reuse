import { Router } from "express";

import { auth, notAuth } from "../middlewares/auth.middleware.js";
import loginController from "../controllers/login.controller.js";

const router = Router();

router.get("/", notAuth, loginController.getPage);
router.post("/api/credentials", notAuth, loginController.login);
router.get("/api/checkLogin", auth, loginController.loggedIn);

export default router;
