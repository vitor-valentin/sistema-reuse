import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { checkPermissionLevel } from "../utils/checkPermission.js";

export function auth(req, res, next) {
    const token = req.cookies?.reuseToken;

    if (!token) return res.status(401).json({ error: "Token não encontrado" });

    try {
        jwt.verify(token, env.JWT_SECRET);
        next();
    } catch (err) {
        return res
            .status(401)
            .json({ error: "Acesso Negado. Token Inválido." });
    }
}

export function notAuth(req, res, next) {
    const token = req.cookies?.reuseToken;

    if (token) {
        try {
            jwt.verify(token, env.JWT_SECRET);
            return res.redirect("/");
        } catch (err) {
            res.clearCookie("reuseToken");
            next();
        }
    } else next();
}

export function tfAuth(req, res, next) {
    const tfToken = req.cookies?.reuseTFToken;

    if (!tfToken) return res.status(401).json({ error: "Token não encontrado" });

    try {
        jwt.verify(tfToken, env.TFAUTH_JWT_SECRET);
        next();
    } catch (err) {
        return res
            .status(401)
            .json({ error: "Acesso Negado. Token Inválido." });
    }
}

export async function adminAuth(req, res, next) {
    const token = req.cookies?.reuseToken;

    if (!token) return res.status(401).json({ error: "Token não encontrado" });

    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        if(payload.role !== "admin") return res.status(401).json({ error: "Acesso negado." });

        const segments = req.path.split("/");
        const target = segments[1];

        const permissions = await checkPermissionLevel(payload.id);
        let permitted = false;

        switch(target) {
            case "categorias":
                if(permissions.includes("ADMIN") || permissions.includes("MANAGE_CATEGORIES")) permitted = true;
                break;
            case "usuarios":
                if(permissions.includes("ADMIN")) permitted = true;
                break;
            case "pedidos":
                if(permissions.includes("ADMIN") || permissions.includes("MANAGE_SOLICITATIONS")) permitted = true;
                break;
            default:
                permitted = true;
                break;
        }
        
        if(!permitted) return res.status(401).json({ error: "Acesso negado." });
        next();
    } catch(err) {
        return res.status(401).json({ error: "Accesso Negado." });
    }
}