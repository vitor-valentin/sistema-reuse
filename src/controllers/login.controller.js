import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { publicDir } from "../utils/paths.js";
import { env } from "../config/env.js";
import { generateToken } from "../utils/generateToken.js";
import { sendTwoFactorEmail } from "../utils/sendMail.js";

import { getEmpresaCredentials, getEmpresa } from "../models/empresas.model.js";
import { getEmpresaConfig } from "../models/configs.model.js";
import { createVerificationCode, getLastVerificationCode, deleteUsedCode } from "../models/verification.model.js";
import { getAdmin, getAdminCredentials } from "../models/admins.model.js";

async function generateAndSendCode(empresaId, email, nome) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await createVerificationCode(empresaId, 1, 15, code);

    await sendTwoFactorEmail(email, nome, code);

    return code;
}

async function isRateLimited(empresaId) {
    const lastCode = await getLastVerificationCode(empresaId, 1); 
    
    if (!lastCode) return false;

    const lastSent = new Date(lastCode.dataCriacao).getTime();
    const now = new Date().getTime();
    const diffSeconds = (now - lastSent) / 1000;

    return diffSeconds < 60;
}

export default {
    async getPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/login.html"));
    },

    async login(req, res) {
        const { login, password } = req.body;
        try {
            var result = await getEmpresaCredentials(login);
            const isAdmin = await getAdminCredentials(login);
            if(isAdmin.length > 0) result = isAdmin;
            
            if (result.length == 0 || (!result[0].cadastroAtivo && isAdmin.length == 0) || (!result[0].status && isAdmin.length > 0))
                return res
                    .status(404)
                    .json({ error: "E-mail ou senha incorretos" });

            const match = await bcrypt.compare(password, result[0].senhaHash);

            if (!match)
                return res
                    .status(404)
                    .json({ error: "E-mail ou senha incorretos" });

            const payload = { id: result[0].idEmpresa ? result[0].idEmpresa : result[0].idUsuario };

            let token;
            if(isAdmin.length == 0){
                const config = await getEmpresaConfig(result[0].idEmpresa);

                if (config.length == 0)
                    return res
                        .status(500)
                        .json({ error: "Erro ao carregar configurações, por favor, entre em contato com nosso suporte." });
                        
                if (config[0].segAutDuasEtapas) {
                    await generateAndSendCode(
                        result[0].idEmpresa,
                        result[0].emailCorporativo,
                        result[0].nomeResponsavel
                    );

                    const tfToken = generateToken(payload, env.TFAUTH_JWT_SECRET);
                    res.cookie("reuseTFToken", tfToken, {
                        httpOnly: true,
                        maxAge: env.TOKEN_EXPIRY
                    });
                    return res.status(301).send();
                }
                
                payload.role = "user";
            } else {
                payload.role = "admin";
            }

            token = generateToken(payload, env.JWT_SECRET);

            res.cookie("reuseToken", token, {
                httpOnly: true,
                maxAge: env.TOKEN_EXPIRY,
            });
            
            res.json({ message: "Login realizado com sucesso!" });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    async getTFAuthPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/tfauth.html"));
    },

    async sendTFCode(req, res) {
        const tfToken = req.cookies.reuseTFToken;
        let payload;

        try {
            payload = jwt.verify(tfToken, env.TFAUTH_JWT_SECRET);
        } catch(err) {
            return res.status(400).json({error: "Token de Verificação em 2 Etapas Inválido!"});
        }

        const tooSoon = await isRateLimited(payload.id);
        if (tooSoon) {
            return res.status(429).json({error: "Aguarde 1 minuto antes de solicitar um novo código."});
        }

        const empresa = await getEmpresa(payload.id);
        if(empresa.length === 0) return res.status(400).json({error: "Id de empresa inválido"});

        try {
            await generateAndSendCode(
                payload.id, 
                empresa[0].emailCorporativo, 
                empresa[0].nomeResponsavel
            );
            return res.status(200).json({ message: "Código reenviado!" });
        } catch(err) {
            return res.status(400).json({error: "Erro ao processar solicitação"});
        }
    },

    async TFAuth(req, res) {
        const { code } = req.body;
        const tfToken = req.cookies.reuseTFToken;

        if(!code || code.length !== 6) return res.status(400).json({error: "Código inválido"});

        try {
            const payload = jwt.verify(tfToken, env.TFAUTH_JWT_SECRET);

            const lastVerificationCode = await getLastVerificationCode(payload.id);
            const verificationData = lastVerificationCode[0];

            if (!verificationData || verificationData.codigo !== code) 
                return res.status(401).json({error: "Código inválido."});

            const now = new Date();
            const expiration = new Date(verificationData.dataExpiracao);

            if(now > expiration) 
                return res.status(400).json({error: "Código expirado."});

            const finalToken = generateToken({id: payload.id}, env.JWT_SECRET);

            res.clearCookie("reuseTFToken");
            res.cookie("reuseToken", finalToken, {
                httpOnly: true,
                maxAge: env.TOKEN_EXPIRY,
            });

            await deleteUsedCode(payload.id, 1);

            return res.status(200).json({message: "Autenticação em 2 etapas concluída."});
        } catch(err) {
            return res.status(401).json({error: "Código de verificação expirado"});
        }
    },

    async loggedIn(req, res) {
        res.status(200).json({loggedIn: true});
    }
};
