import { Router } from "express";
import detalhesController from "../controllers/detalhesAnuncio.controller.js";

const router = Router();

router.get("/", detalhesController.getPage);

export default router;