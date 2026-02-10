import configuracoesController from "../controllers/configuracoes.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", configuracoesController.getPage);
router.post("/toggle", configuracoesController.updateToggle);
router.get("/config-empresa", configuracoesController.getConfig);
router.post("/config-empresa", configuracoesController.updateConfig);
router.post("/configuracoes/senha", configuracoesController.updatePassword);

export default router;