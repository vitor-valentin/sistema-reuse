import { db } from "../config/database.js";

export async function getEmpresaCredentials(login) {
    const [rows] = await db.query(
        "SELECT * FROM tbEmpresas WHERE cnpj = ? OR emailCorporativo = ?",
        [login, login]
    );
    return rows;
}

export async function getEmpresa(id) {
    const [rows] = await db.query(
        "SELECT * FROM tbEmpresas WHERE idEmpresa = ?",
        [id]
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
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.publicKey, data.privateKey, data.salt, data.iv, data.cnpj, data.razao_social,
                data.nome_fantasia, data.email_corp, data.telefone, data.nome_resp, data.cpf_resp,
                data.senha, data.cep, data.estado, data.cidade, data.bairro, data.endereco,
                data.numero, data.complemento, data.comprovante_end, data.cartao_cnpj, 
                data.contrato_social, "", new Date(), false
            ]
        );
        return true;
    } catch(err) {
        console.error("[Error]: ", err);
        return err;
    }
}

export async function resetPassword(id, pass) {
    try {
        await db.query(
            "UPDATE tbEmpresas SET senhaHash = ? WHERE idEmpresa = ?",
            [pass, id]
        );
        return true;
    } catch(err) {
        console.error("[Error]: ", err);
        return err;
    }
}

export async function getManySolicitations(skip, limit, search = '') {
    let query = "SELECT * FROM tbEmpresas WHERE cadastroAtivo = 0";
    let params = [];

    if(search){
        query += ` AND razaoSocial LIKE ? OR nomeFantasia LIKE ? OR nomeFantasia LIKE ?
        OR emailCorporativo LIKE ? OR foneCorporativo LIKE ? OR nomeResponsavel LIKE ?
        OR cpfResponsavel LIKE ? OR cepEmpresa LIKE ? OR estado LIKE ? OR cnpj LIKE ?
        `;
        const searchPattern = `%${search}%`;
        params.push(
            searchPattern, searchPattern, searchPattern, 
            searchPattern, searchPattern, searchPattern,
            searchPattern, searchPattern, searchPattern, searchPattern
        );
    }

    query += " ORDER BY idEmpresa DESC LIMIT ? OFFSET ?";
    params.push(limit, skip);

    const [rows] = await db.query(query, params);
    return rows;
}

export async function getTotalSolicitations(search = '') {
    let query = 'SELECT COUNT(*) as total FROM tbEmpresas WHERE cadastroAtivo = 0';
    let params = [];

    if (search) {
        query += ` AND (razaoSocial LIKE ? OR nomeFantasia LIKE ? OR nomeFantasia LIKE ?
        OR emailCorporativo LIKE ? OR foneCorporativo LIKE ? OR nomeResponsavel LIKE ?
        OR cpfResponsavel LIKE ? OR cepEmpresa LIKE ? OR estado LIKE ?)
        `;
        const searchPattern = `%${search}%`;
        params.push(
            searchPattern, searchPattern, searchPattern, 
            searchPattern, searchPattern, searchPattern,
            searchPattern, searchPattern, searchPattern
        );
    }

    const [total] = await db.query(query, params);
    return total;
}

export async function getPendingSolicitationCount() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM tbEmpresas WHERE cadastroAtivo = 0");
    return rows;
}

export async function getPedido(id) {
    const [rows] = await db.query(
        "SELECT * FROM tbEmpresas WHERE idEmpresa = ?",
        [id]
    );
    return rows;
}

export async function updateSolicitationStatus(id, approved) {
    let query;
    
    if(approved) query = 'UPDATE tbEmpresas SET cadastroAtivo = 1, dataAprovacao = CURRENT_TIMESTAMP WHERE idEmpresa = ?';
    else query = 'DELETE FROM tbEmpresas WHERE idEmpresa = ?';

    try {
        await db.query(
            query,
            [id]
        );
        return true;
    } catch (err) {
        return err;
    }
}

export async function getDocuments(id) {
    const [rows] = await db.query(
        "SELECT docComprovanteEndereco, docCartaoCnpj, docContratoSocial, cadastroAtivo FROM tbEmpresas WHERE idEmpresa = ?",
        [id]
    );
    return rows;
}

export async function getTotalEmpresas() {
    const [rows] = await db.query(
        `SELECT 
            COUNT(*) AS total_atual,
            COUNT(CASE WHEN dataAprovacao < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END) AS total_mes_passado,
            COUNT(*) - COUNT(CASE WHEN dataAprovacao < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END) AS aumento_absoluto,
            ROUND(
                ((COUNT(*) - COUNT(CASE WHEN dataAprovacao < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END)) 
                / NULLIF(COUNT(CASE WHEN dataAprovacao < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END), 0)) * 100, 
            2) AS percentual_crescimento
        FROM tbEmpresas
        WHERE cadastroAtivo = 1;`
    );

    return rows;
}

export async function getRecentSolicitations() {
    const [rows] = await db.query(
        "SELECT * FROM tbEmpresas WHERE cadastroAtivo = 0 ORDER BY dataCadastro DESC LIMIT 5"
    );
    return rows;
}

export async function getRecentApprovals() {
    const [rows] = await db.query(
        "SELECT * FROM tbEmpresas WHERE cadastroAtivo = 1 ORDER BY dataAprovacao DESC LIMIT 5"
    );
    return rows;
}