import path from "path";
import bcrypt from "bcryptjs";

import { publicDir } from "../utils/paths.js";
import { env } from "../config/env.js";

export default {
    async getPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/cadastro.html"));
    },

    async sendRequisition(req, res) {
        const data = req.body;
        if(!data) return res.status(500).json({error: "No body was found on the request."});

        data.senha = bcrypt.hash(data.senha, env.SALT);

        data.comprovate_end = req.files?.comprovante_end?.[0].filename || null;
        data.cartao_cnpj = req.files?.cartao_cnpj?.[0].filename || null;
        data.contrato_social = req.files?.contrato_social?.[0].filename || null;
    }
};