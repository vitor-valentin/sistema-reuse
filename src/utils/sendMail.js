import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
    host: env.SMTP_SERVER,
    port: env.SMTP_PORT,
    auth: {
        user: env.BREVO_LOGIN,
        pass: env.BREVO_PASS
    }
});

export const sendSolicitationEmail = async (userEmail, userName) => {
    const mailOptions = {
        from: `"${env.MAIL_NAME}" <${env.MAIL_SENDER}>`,
        to: userEmail,
        subject: "Solicitação de Cadastro em Análise ♻️",
        html: `
            <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .header { background-color: #2563eb; padding: 30px; text-align: center; } /* Using your mainblue */
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px; }
            .content { padding: 40px 30px; line-height: 1.6; color: #333333; }
            .content h2 { color: #1e3a8a; font-size: 22px; } /* Using your darkblue */
            .status-badge { display: inline-block; background-color: #eff6ff; border: 1px solid #2563eb; color: #2563eb; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
            .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>ReUse</h1>
            </div>
            <div class="content">
                <h2>Olá, ${userName}!</h2>
                <p>Recebemos sua solicitação para se tornar um parceiro do <strong>ReUse</strong>, o maior sistema de venda de resíduos eletrônicos do Brasil.</p>
                
                <div style="text-align: center;">
                    <div class="status-badge">
                        <span style="margin-right: 5px;">⏳</span> STATUS: EM ANÁLISE
                    </div>
                </div>

                <p>Nossa equipe técnica está revisando os documentos anexados. Este processo garante a segurança de todos os negociantes em nossa plataforma.</p>
                
                <div class="divider"></div>
                
                <p><strong>O que acontece agora?</strong></p>
                <ul>
                    <li>Análise documental (1-3 dias úteis).</li>
                    <li>Você receberá um e-mail de aprovação ou feedback.</li>
                    <li>Após aprovado, seu acesso total será liberado.</li>
                </ul>

                <p>Se tiver alguma dúvida, sinta-se à vontade para responder a este e-mail.</p>
                
                <p>Atenciosamente,<br>
                <strong>Equipe de Onboarding ReUse</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2026 ReUse Brasil - Reciclagem Tecnológica Sustentável</p>
                <p>Você recebeu este e-mail porque uma solicitação de cadastro foi realizada com este endereço.</p>
            </div>
        </div>
    </body>
    </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch(error) {
        console.error("Erro ao enviar e-mail: ", error);
    }
};

export const sendTwoFactorEmail = async (userEmail, userName, code) => {
    const mailOptions = {
        from: `"${env.MAIL_NAME}" <${env.MAIL_SENDER}>`,
        to: userEmail,
        subject: `${code} é seu código de segurança ReUse 🛡️`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                    .header { background-color: #2563eb; padding: 30px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px; }
                    .content { padding: 40px 30px; line-height: 1.6; color: #333333; text-align: center; }
                    .content h2 { color: #1e3a8a; font-size: 22px; margin-bottom: 20px; }
                    .code-container { margin: 30px 0; }
                    .code-box { 
                        display: inline-block; 
                        background-color: #eff6ff; 
                        border: 2px dashed #2563eb; 
                        color: #1e3a8a; 
                        padding: 15px 30px; 
                        font-size: 32px; 
                        font-weight: bold; 
                        letter-spacing: 8px; 
                        border-radius: 12px;
                    }
                    .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                    .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
                    .warning { font-size: 14px; color: #6b7280; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ReUse</h1>
                    </div>
                    <div class="content">
                        <h2>Verificação de Segurança</h2>
                        <p>Olá, <strong>${userName}</strong>!</p>
                        <p>Use o código de verificação abaixo para acessar sua conta. Por motivos de segurança, ele expira em breve.</p>
                        
                        <div class="code-container">
                            <div class="code-box">${code}</div>
                        </div>

                        <p class="warning">Se você não solicitou este código, ignore este e-mail ou entre em contato com nosso suporte.</p>
                        
                        <div class="divider"></div>
                        
                        <p>Atenciosamente,<br>
                        <strong>Equipe de Segurança ReUse</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 ReUse Brasil - Reciclagem Tecnológica Sustentável</p>
                        <p>Este é um e-mail automático. Por favor, não responda.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch(error) {
        console.error("Erro ao enviar e-mail de 2FA: ", error);
    }
};

export const sendPasswordResetEmail = async (userId, userEmail, userName, resetToken) => {
    const resetUrl = `http://localhost:8080/recuperar-senha/${userId}/${resetToken}`;

    const mailOptions = {
        from: `"${env.MAIL_NAME}" <${env.MAIL_SENDER}>`,
        to: userEmail,
        subject: "Redefinição de Senha - ReUse 🔐",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                    .header { background-color: #2563eb; padding: 30px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px; }
                    .content { padding: 40px 30px; line-height: 1.6; color: #333333; text-align: center; }
                    .content h2 { color: #1e3a8a; font-size: 22px; margin-bottom: 10px; }
                    .btn-container { margin: 35px 0; }
                    .button { 
                        background-color: #2563eb; 
                        color: #ffffff !important; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        font-size: 18px; 
                        font-weight: bold; 
                        border-radius: 25px; 
                        display: inline-block;
                        box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
                    }
                    .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                    .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
                    .small-text { font-size: 13px; color: #6b7280; margin-top: 25px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ReUse</h1>
                    </div>
                    <div class="content">
                        <h2>Recuperação de Acesso</h2>
                        <p>Olá, <strong>${userName}</strong>!</p>
                        <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>ReUse</strong>. Clique no botão abaixo para escolher uma nova senha:</p>
                        
                        <div class="btn-container">
                            <a href="${resetUrl}" class="button">Redefinir Minha Senha</a>
                        </div>

                        <p class="small-text">Este link é válido por 24 horas. Se você não solicitou a alteração, pode ignorar este e-mail com segurança.</p>
                        
                        <div class="divider"></div>
                        
                        <p style="font-size: 12px; color: #9ca3af;">Se o botão não funcionar, copie e cole o link no seu navegador:<br>
                        <span style="word-break: break-all; color: #2563eb;">${resetUrl}</span></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 ReUse Brasil - Reciclagem Tecnológica Sustentável</p>
                        <p>Proteja sua conta: Nunca compartilhe este link com ninguém.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch(error) {
        console.error("Erro ao enviar e-mail de recuperação: ", error);
        throw error;
    }
};

export const sendWelcomeEmail = async (userEmail, userName, password) => {
    const loginUrl = `http://localhost:8080/login`;

    const mailOptions = {
        from: `"${env.MAIL_NAME}" <${env.MAIL_SENDER}>`,
        to: userEmail,
        subject: "Bem-vindo ao ReUse - Suas Credenciais de Acesso 🌱",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                    /* Header changed to Blue */
                    .header { background-color: #2563eb; padding: 30px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px; }
                    .content { padding: 40px 30px; line-height: 1.6; color: #333333; }
                    .welcome-header { text-align: center; margin-bottom: 30px; }
                    /* Welcome title changed to Dark Blue */
                    .welcome-header h2 { color: #1e3a8a; font-size: 22px; margin-bottom: 10px; }
                    .credentials-box { 
                        /* Light Blue background and Blue dashed border */
                        background-color: #f0f7ff; 
                        border: 1px dashed #2563eb; 
                        padding: 20px; 
                        border-radius: 12px; 
                        margin: 25px 0;
                    }
                    .credential-item { margin: 10px 0; font-size: 15px; }
                    .btn-container { text-align: center; margin: 35px 0; }
                    .button { 
                        /* Button changed to System Blue */
                        background-color: #2563eb; 
                        color: #ffffff !important; 
                        padding: 15px 35px; 
                        text-decoration: none; 
                        font-size: 18px; 
                        font-weight: bold; 
                        border-radius: 25px; 
                        display: inline-block;
                        box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
                    }
                    .warning-box {
                        font-size: 13px;
                        color: #6b7280;
                        background-color: #fffbeb;
                        border-left: 4px solid #f59e0b;
                        padding: 15px;
                        margin-top: 25px;
                    }
                    .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ReUse</h1>
                    </div>
                    <div class="content">
                        <div class="welcome-header">
                            <h2>Bem-vindo ao Time!</h2>
                            <p>Olá, <strong>${userName}</strong>! Sua conta no sistema ReUse foi criada com sucesso.</p>
                        </div>

                        <p>Abaixo estão suas credenciais de acesso temporárias. Recomendamos que você realize o login e altere sua senha no seu primeiro acesso.</p>
                        
                        <div class="credentials-box">
                            <div class="credential-item"><strong>E-mail:</strong> ${userEmail}</div>
                            <div class="credential-item"><strong>Senha Temporária:</strong> <code style="background:#fff; padding:2px 5px; border-radius:4px; border: 1px solid #e5e7eb;">${password}</code></div>
                        </div>

                        <div class="btn-container">
                            <a href="${loginUrl}" class="button">Acessar Sistema</a>
                        </div>

                        <div class="warning-box">
                            <strong>⚠️ Segurança:</strong>
                            <p style="margin: 5px 0 0 0;">Por questões de segurança, nunca compartilhe estas credenciais. Após o login, acesse seu <strong>Perfil</strong> para definir uma senha pessoal e segura.</p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>&copy; 2026 ReUse Brasil - Reciclagem Tecnológica Sustentável</p>
                        <p>Se você não esperava este convite, entre em contato com o suporte da sua unidade.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch(error) {
        console.error("Erro ao enviar e-mail de boas-vindas: ", error);
        throw error;
    }
};

export const sendApprovalEmail = async (userEmail, userName) => {
    const loginUrl = `http://localhost:8080/login`;

    const mailOptions = {
        from: `"${env.MAIL_NAME}" <${env.MAIL_SENDER}>`,
        to: userEmail,
        subject: "Cadastro Aprovado! Bem-vindo ao ReUse 🚀",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                    .header { background-color: #2563eb; padding: 30px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px; }
                    .content { padding: 40px 30px; line-height: 1.6; color: #333333; }
                    .content h2 { color: #1e3a8a; font-size: 22px; text-align: center; }
                    .success-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0; }
                    .btn-container { text-align: center; margin: 35px 0; }
                    .button { background-color: #2563eb; color: #ffffff !important; padding: 15px 35px; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 25px; display: inline-block; }
                    .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header"><h1>ReUse</h1></div>
                    <div class="content">
                        <h2>Ótimas notícias, ${userName}!</h2>
                        <p>É com prazer que informamos que sua documentação foi revisada e seu cadastro foi aprovado com sucesso.</p>
                        
                        <div class="success-box">
                            <strong>Sua conta está ativa!</strong><br>
                            Agora você já pode publicar anúncios e negociar resíduos eletrônicos em nossa plataforma.
                        </div>

                        <div class="btn-container">
                            <a href="${loginUrl}" class="button">Começar a Usar</a>
                        </div>

                        <p>Recomendamos que sua primeira ação seja completar as informações do seu perfil para aumentar a confiança em suas negociações.</p>
                        
                        <p>Atenciosamente,<br><strong>Equipe de Parcerias ReUse</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 ReUse Brasil - Reciclagem Tecnológica Sustentável</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch(error) {
        console.error("Erro ao enviar e-mail de aprovação: ", error);
    }
};

export const sendDenialEmail = async (userEmail, userName, reason = "Inconsistência nos documentos enviados.") => {
    const mailOptions = {
        from: `"${env.MAIL_NAME}" <${env.MAIL_SENDER}>`,
        to: userEmail,
        subject: "Atualização sobre sua solicitação no ReUse ⚠️",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                    .header { background-color: #2563eb; padding: 30px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px; }
                    .content { padding: 40px 30px; line-height: 1.6; color: #333333; }
                    .content h2 { color: #1e3a8a; font-size: 22px; }
                    .error-box { background-color: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 20px; border-radius: 12px; margin: 25px 0; }
                    .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header"><h1>ReUse</h1></div>
                    <div class="content">
                        <h2>Olá, ${userName}.</h2>
                        <p>Agradecemos seu interesse em se tornar um parceiro do <strong>ReUse</strong>.</p>
                        
                        <p>Após uma análise detalhada dos dados e documentos fornecidos, informamos que não foi possível aprovar seu cadastro neste momento.</p>
                        
                        <div class="error-box">
                            <strong>Motivo da recusa:</strong><br>
                            ${reason}
                        </div>

                        <p>Caso você acredite que houve um erro ou deseje enviar novos documentos, você pode realizar uma nova solicitação em nosso portal após 48 horas.</p>
                        
                        <p>Dúvidas? Responda a este e-mail para falar com nosso suporte técnico.</p>
                        
                        <p>Atenciosamente,<br><strong>Equipe de Compliance ReUse</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 ReUse Brasil - Reciclagem Tecnológica Sustentável</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch(error) {
        console.error("Erro ao enviar e-mail de recusa: ", error);
    }
};