import { Router } from "express";

import { notAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import cadastroController from "../controllers/cadastro.controller.js";

const router = Router();

router.get("/", notAuth, cadastroController.getPage);
router.post("/api/sendSolicitation", notAuth,
    upload.fields([
        { name: "comprovante_end", maxCount: 1 },
        { name: "cartao_cnpj", maxCount: 1 },
        { name: "contrato_social", maxCount: 1 }
    ]), cadastroController.sendRequisition);

export default router;