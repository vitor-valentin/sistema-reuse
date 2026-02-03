import { Router } from "express";

import { auth, notAuth } from "../middlewares/auth.middleware.js";
import landingPageController from "../controllers/landingPage.controller.js";

const router = Router();

router.get("/", landingPageController.getPage);

router.get("/auth/check", landingPageController.checkAuth);

router.get("/api/anuncios", landingPageController.list);

router.post("/credentials", notAuth, landingPageController.landing);

export default router;
