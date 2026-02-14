import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";

import { publicDir, srcDir } from "../utils/paths.js"
import { env } from "../config/env.js";

import { checkPermissionLevel } from "../utils/checkPermission.js";
import { sendWelcomeEmail, sendApprovalEmail, sendDenialEmail } from "../utils/sendMail.js";

import { getAdmin, getManyUsers, getTotalUsers, createAdmin, editAdmin, deleteAdmin } from "../models/admins.model.js";
import { deleteCategoria, createCategoria, editCategoria, getCategoria, getManyCategories, getTotalCategories } from "../models/categories.model.js";
import { getCountAnunciosCategoria } from "../models/anuncios.model.js";
import { getDocuments, getEmpresa, getManySolicitations, getPedido, getPendingSolicitationCount, getTotalSolicitations, updateSolicitationStatus } from "../models/empresas.model.js";

function generatePassword(length = 16) {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%&*+:;?-=";

    const allChars = uppercase + lowercase + numbers + symbols;
    let password = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }

    return password;
}

export default {
    //Dashboard

    async getDashboardPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/admin.dashboard.html"));
    },

    // Users

    async getUsuariosPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/admin.usuarios.html"));
    },

    async getPermissions(req, res) {
        const token = req.cookies?.reuseToken;

        if (!token) return res.status(401).json({ error: "Token não encontrado" });

        try {
            const payload = jwt.verify(token, env.JWT_SECRET);
            if(payload.role !== "admin") return res.status(401).json({ error: "Token não encontrado!" });

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
            const payload = jwt.verify(token, env.JWT_SECRET);
            if(payload.role !== "admin") return res.status(401).json({ error: "Token não encontrado!" });

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
    },

    async getUsers(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const skip = (page - 1) * limit;

        try {
            const users = await getManyUsers(skip, limit, search);
            const total = await getTotalUsers(search);
            
            const totalPages = Math.ceil(total[0].total / limit);

            res.json({ users, totalPages });
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            res.status(500).json({ error: "Erro interno no servidor" });
        }
    },

    async getUser(req, res) {
        const id = parseInt(req.params.id);
        if(!id || !Number.isInteger(id)) return res.status(400).json({error: "Id inválido"});

        const result = await getAdmin(id);
        if(result.length === 0) return res.status(400).json({error: "Não existe um usuário com este id"});

        res.json({result: result[0]});
    },

    async createUser(req, res) {
        const data = req.body;

        if(data.senha === "") {
            data.senha = generatePassword();
        }

        let senhaOriginal = data.senha;
        data.senha = await bcrypt.hash(data.senha, env.SALT);

        const result = await createAdmin(data);
        if(result !== true) {
            console.error(result);
            return res.status(500).json({error: "Erro ao cadastrar novo usuário"});
        }

        sendWelcomeEmail(data.email, data.nome, senhaOriginal);

        res.status(200).json({ message: "Usuário criado com succeso!" });
    },

    async editUser(req, res) {
        const id = parseInt(req.params.id);
        const data = req.body;
        if(!id || !Number.isInteger(id)) return res.status(400).json({error: "Id inválido"});
  
        const changePass = data.senha === "" ? data.senha : ", senhaHash = ?";
        const senhaHash = await bcrypt.hash(data.senha, env.SALT);

        const result = await editAdmin(id, data, changePass, senhaHash);
        if(result !== true) {
            console.error(result);
            return res.status(500).json({ error: "Erro ao editar o usuário" });
        }

        res.json({message: "Usuário editado com sucesso!"});
    },

    async deleteUser(req, res) {
        const id = parseInt(req.body.id);

        if(!id || !Number.isInteger(id)) return res.status(400).json({error: "Id inválido!"});
        
        const result = await deleteAdmin(id);
        if(result !== true) {
            console.error(result);
            return res.status(500).json({error: "Erro ao deletar o usuário"});
        }

        res.json({message: "Usuário deletado com sucesso"});
    },

    // Categories

    async getCategoriesPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/admin.categorias.html"));
    },

    async getCategories(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const skip = (page - 1) * limit;

        try {
            const categorias = await getManyCategories(skip, limit, search);
            const total = await getTotalCategories(search);
            
            const totalPages = Math.ceil(total[0].total / limit);

            let anunciosCount = [];
            if(categorias.length != 0) {
                anunciosCount = await Promise.all(
                    categorias.map(async (cat) => {
                        const countCategory = await getCountAnunciosCategoria(cat.idCategoria);
                        return countCategory;
                    })
                );
            }

            res.json({ categorias, totalPages, anunciosCount });
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
            res.status(500).json({ error: "Erro interno no servidor" });
        }
    },

    async getCategory(req, res) {
        const id = parseInt(req.params.id);
        if(!id || !Number.isInteger(id)) return res.status(400).json({error: "Id inválido"});

        const result = await getCategoria(id);
        if(result.length === 0) return res.status(400).json({error: "Não existe uma categoria com este id"});

        res.json({result: result[0]});
    },

    async createCategory(req, res) {
        const data = req.body;

        const result = await createCategoria(data);
        if(result !== true) {
            console.error(result);
            return res.status(500).json({error: "Erro ao cadastrar nova categoria"});
        }

        res.status(200).json({ message: "Categoria criada com succeso!" });
    },

    async editCategory(req, res) {
        const id = parseInt(req.params.id);
        const data = req.body;
        if(!id || !Number.isInteger(id)) return res.status(400).json({error: "Id inválido"});

        const result = await editCategoria(id, data);
        if(result !== true) {
            console.error(result);
            return res.status(500).json({ error: "Erro ao editar a categoria" });
        }

        res.json({message: "Categoria editada com sucesso!"});
    },

    async deleteCategory(req, res) {
        const id = parseInt(req.body.id);

        if(!id || !Number.isInteger(id)) return res.status(400).json({error: "Id inválido!"});
        
        const result = await deleteCategoria(id);
        if(result !== true) {
            console.error(result);
            return res.status(500).json({error: "Erro ao deletar a categoria"});
        }

        res.json({message: "Categoria deletada com sucesso"});
    },

    //Solicitations

    async getSolicitationPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/admin.pedidos.html"));
    },

    async getSolicitations(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const skip = (page - 1) * limit;

        try {
            const pedidos = await getManySolicitations(skip, limit, search);
            const total = await getTotalSolicitations(search);
            
            const totalPages = Math.ceil(total[0].total / limit);

            const pendingCount = await getPendingSolicitationCount();

            res.json({ pedidos, totalPages, pendingCount: pendingCount[0].total });
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
            res.status(500).json({ error: "Erro interno no servidor" });
        }
    },

    async getSolicitation(req, res) {
        const id = parseInt(req.params.id);
        if(!id || !Number.isInteger(id)) return res.status(400).json({error: "Id inválido"});

        const result = await getPedido(id);
        if(result.length === 0) return res.status(400).json({error: "Não existe um pedido com este id"});

        res.json({result: result[0]});
    },

    async updateSolicitation(req, res) {
        const { id, status } = req.body;
        
        const empresa = await getEmpresa(id);
        if(empresa.length == 0) return res.status(400).json({ error: "Id inválido" });

        const filenames = [
            empresa[0].docComprovanteEndereco,
            empresa[0].docCartaoCNPJ,
            empresa[0].docContratoSocial
        ];
        const paths = [
            "comprovante_end",
            "cartao_cnpj",
            "contrato_social"
        ];

        filenames.forEach((filename, index) => {
            if(filename){
                const file = path.join(srcDir, "private_uploads", paths[index], filename);
                if(fs.existsSync(file)) fs.unlinkSync(file);
            }
        });

        const result = await updateSolicitationStatus(id, status === 'aprovado');

        if(!result) {
            console.error(result);
            return res.status(500).json({ error: result });
        }

        if(status === 'aprovado') sendApprovalEmail(empresa[0].emailCorporativo, empresa[0].nomeResponsavel);
        else sendDenialEmail(empresa[0].emailCorporativo, empresa[0].nomeResponsavel);

        return res.json({ message: "Solicitação atualizada com sucesso!" });
    },

    // Miscelaneous

    async getDocument(req, res) {
        const type = req.params.type;
        const idEmpresa = parseInt(req.params.idEmpresa);
        if(!idEmpresa || !Number.isInteger(idEmpresa)) return res.status(400).json({ error: "Id inválido" });

        const rowNames = [
            "docCartaoCnpj",
            "docComprovanteEndereco",
            "docContratoSocial"
        ];
        const types = [
            "cartao_cnpj",
            "comprovante_end",
            "contrato_social"
        ];
        if(!type || !types.includes(type)) return res.status(400).json({ error: "Tipo de documento inválido!" });

        const documents = await getDocuments(idEmpresa);
        if(documents.length == 0) return res.status(400).json({ error: "Id inválido" });
        if(documents[0].cadastroAtivo) return res.status(401).json({ error: "Este usuário já foi aprovado no sistema!" });
        if((documents[0].docContratoSocial == "" || documents[0].docContratoSocial == null) && type === "contrato_social")
            return res.status(400).json({ error: "O usuário não possuí este documento" });

        const filename = documents[0][rowNames[types.indexOf(type)]];
        const filePath = path.join(srcDir, "private_uploads", type, filename);

        if(fs.existsSync(filePath)) {
            const ext = path.extname(filename).toLowerCase();
            const mimeTypes = {
                '.pdf': 'application/pdf',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.webp': 'image/webp'
            };

            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');

            res.sendFile(filePath);
        } else {
            res.status(404).json({ error: "Arquivo não encontrado" });
        }
    }
}