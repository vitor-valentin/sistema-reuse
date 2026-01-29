import { Router } from "express";
import anuncieController from "../controllers/anuncie.controller.js";
import { auth, notAuth } from "../middlewares/auth.middleware.js";
import { uploadAnuncio } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", anuncieController.getPage);
router.post("/api/sendSolicitation", 
    notAuth,
    uploadAnuncio.fields([
        { name: "imagens_produto", maxCount: 5 }
    ]), 
    anuncieController.sendRequisition
);

export default router;