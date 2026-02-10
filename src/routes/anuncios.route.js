import { Router } from "express";
import { listarAnuncios, criarAnuncio } from "../controllers/anuncios.controller.js";
import { uploadAnuncio } from "../middlewares/uploadAnuncio.middleware.js"; 
import { auth, notAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/anuncie/api/anuncios", listarAnuncios);
router.post("/anuncie", auth, uploadAnuncio.array("imagens_produto", 5), criarAnuncio);

export default router;
