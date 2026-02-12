import path from "path";
import jwt from "jsonwebtoken";

import { publicDir } from "../utils/paths.js"
import { env } from "../config/env.js";

import { checkPermissionLevel } from "../utils/checkPermission.js";

import { getAdmin } from "../models/admins.model.js";

export default {
    async getDashboard(req, res) {
        res.sendFile(path.join(publicDir, "pages/admin.dashboard.html"));
    },

    async getUsuarios(req, res) {
        res.sendFile(path.join(publicDir, "pages/admin.usuarios.html"));
    },

    async getPermissions(req, res) {
        const token = req.cookies?.reuseToken;

        if (!token) return res.status(401).json({ error: "Token não encontrado" });

        try {
            const payload = jwt.verify(token, env.ADMIN_JWT_SECRET);

            const permissions = await checkPermissionLevel(payload.id);

            res.json({permissions});
        }catch(err) {
            return res.status(401).json({ error: "Token inválido" });
        }
    },

    async getUserInfo(req, res) {
        const token = req.cookies?.reuseToken;

        if (!token) return res.status(401).json({ error: "Token não encontrado!" });

        try {
            const payload = jwt.verify(token, env.ADMIN_JWT_SECRET);

            const info = await getAdmin(payload.id);
            if(!info || info.length == 0) return res.status(400).json({ error: "Usuário não encontrado!" });

            const data = {
                nome: info[0].nome,
                cargo: info[0].cargo
            };

            res.json({ data });
        } catch(err) {
            return res.status(401).json({ error: "Token inválido" });
        }
    }
}