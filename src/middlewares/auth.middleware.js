import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

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
            return res.status(401).json({ error: "Token encontrado." });
        } catch (err) {
            res.clearCookie("reuseToken");
            next();
        }
    } else next();
}
