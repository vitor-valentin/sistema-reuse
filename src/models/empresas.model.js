import { db } from "../config/database.js";

export async function getEmpresaCredentials(login) {
    const [rows] = await db.query(
        "SELECT * FROM tbEmpresas WHERE cnpj = ? OR emailCorporativo = ?",
        [login, login]
    );
    return rows;
}

export async function insertEmpresa(data) {
    try {
        await db.query(
            `INSERT INTO tbEmpresas (ikPublica, ikPrivada, salt, iv, cnpj, razaoSocial, 
            nomeFantasia, emailCorporativo, foneCorporativo, nomeResponsavel, 
            cpfResponsavel, senhaHash, cepEmpresa, estado, cidade, bairro, endereco, 
            numEndereco, compEndereco, docComprovanteEndereco, docCartaoCnpj, 
            docContratoSocial, descricao, dataCadastro, cadastroAtivo) VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.publicKey, data.privateKey, data.salt, data.iv, data.cnpj, data.razao_social,
                data.nome_fantasia, data.email_corp, data.telefone, data.nome_resp, data.cpf_resp,
                data.senha, data.cep, data.estado, data.cidade, data.bairro, data.endereco,
                data.numero, data.complemento, data.comprovante_end, data.cartao_cnpj, 
                data.contrato_social, "", new Date().toISOString, false
            ]
        );
    } catch(err) {
        console.error("[Error]: ", err);
    }
}