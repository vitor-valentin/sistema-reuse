import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateToken(payload, secret) {
    return jwt.sign(payload, secret, {expiresIn: env.TOKEN_EXPIRY});
}