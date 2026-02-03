import path from "path";
import { publicDir } from "../utils/paths.js";
import { getAnuncios, insertAnuncio } from "../models/anuncios.model.js";

export default {
    async getPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/anuncie.html"));
    },

    async list(req, res) {
        try {
            const anuncios = await getAnuncios();
            res.json(anuncios);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    async sendRequisition(req, res) {
        const data = req.body;

        if (!data) return res.status(400).json({ error: "No body was found on the request." });

        const files = req.files?.imagens_produto;

        const result = await insertAnuncio(data, files);

        if (result !== true) {
            return res.status(500).json({ error: result });
        }

        return res.status(200).json({ message: "Anúncio publicado com sucesso!" });
    }
};
