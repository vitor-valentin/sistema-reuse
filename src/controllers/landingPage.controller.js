import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { publicDir } from "../utils/paths.js";
import { env } from "../config/env.js";
import { generateToken } from "../utils/generateToken.js";

import { getAnuncios } from "../models/anuncios.model.js";
import { getEmpresaCredentials } from "../models/empresas.model.js";

export default {
    async getPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/landingPage.html"));
    },

    async landing(req, res) {
        const { login, password } = req.body;
        try {
            const result = await getEmpresaCredentials(login);

            if (result.length == 0)
                return res
                    .status(404)
                    .json({ error: "E-mail ou senha incorretos" });

            const match = await bcrypt.compare(password, result[0].senhaHash);

            if (!match)
                return res
                    .status(404)
                    .json({ error: "E-mail ou senha incorretos" });

            const payload = { id: result[0].idEmpresa };
            const token = generateToken(payload);

            res.cookie("reuseToken", token, {
                httpOnly: true,
                maxAge: env.TOKEN_EXPIRY,
            });
            res.json({ message: "Login realizado com sucesso!" });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    async checkAuth(req, res) {
        const token = req.cookies.reuseToken;

        if (!token)
            return res.json({ loggedIn: false });

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            return res.json({ loggedIn: true, id: decoded.id });

        } catch {
            return res.json({ loggedIn: false });
        }
    },

    async list(req, res) {
        try {
            const anuncios = await getAnuncios();
            res.json(anuncios);
        } catch (err) {
            res.status(500).json(err);
        }
    }
};