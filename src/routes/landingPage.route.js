import { Router } from "express";

import { auth, notAuth } from "../middlewares/auth.middleware.js";
import landingPageController from "../controllers/LP.controller.js";

const router = Router();

router.get("/landingPage", landingPageController.getPage);

router.get("/check-login", (req, res) => {
    const token = req.cookies.reuseToken;
    if (!token) return res.json({ loggedIn: false });

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        res.json({ loggedIn: true, id: decoded.id });
    } catch (err) {
        res.json({ loggedIn: false });
    }
});

router.post("/credentials", notAuth, landingPageController.landing);

export default router;