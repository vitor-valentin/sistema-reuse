import { db } from "../config/database.js";

export async function getCategoria(id) {
    const [rows] = await db.query(
        "SELECT * FROM tbCategorias WHERE idCategoria = ?",
        [id]
    );
    return rows;
}

export async function getManyCategories(skip, limit, search = '') {
    let query = "SELECT idCategoria, nome, descricao FROM tbCategorias";
    let params = [];

    if (search) {
        query += " WHERE nome LIKE ? OR descricao LIKE ?";
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
    }

    query += " ORDER BY idCategoria DESC LIMIT ? OFFSET ?";
    params.push(limit, skip);

    const [rows] = await db.query(query, params);
    return rows;
}

export async function getTotalCategories(search = '') {
    let query = 'SELECT COUNT(*) as total FROM tbCategorias';
    let params = [];

    if (search) {
        query += " WHERE nome LIKE ? OR descricao LIKE ?";
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
    }

    const [total] = await db.query(query, params);
    return total;
}

export async function createCategoria(data) {
    try {
        await db.query(
            `INSERT INTO tbCategorias (nome, descricao)
            VALUES (?, ?)`,
            [data.nome, data.descricao] 
        );
        return true;
    } catch (err) {
        return err;
    }
}

export async function editCategoria(id, data) {
    try {
        await db.query(
            "UPDATE tbCategorias SET nome = ?, descricao = ? WHERE idCategoria = ?",
            [data.nome, data.descricao, id]
        );
        return true;
    } catch(err) {
        return err;
    }
}

export async function deleteCategoria(id) {
    try {
        await db.query(
            "DELETE FROM tbCategorias WHERE idCategoria = ?",
            [id]
        );
        return true;
    } catch(err) {
        return err;
    }
}