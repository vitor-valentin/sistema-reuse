import { db } from "../config/database.js";

export async function getAdminCredentials(login) {
    const [rows] = await db.query(
        "SELECT * FROM tbUsuariosSistema WHERE email = ?",
        [login]
    );
    return rows;
}

export async function getAdmin(id) {
    const [rows] = await db.query(
        "SELECT * FROM tbUsuariosSistema WHERE idUsuario = ?",
        [id]
    );
    return rows;
}

export async function getManyUsers(skip, limit, search = '') {
    let query = "SELECT idUsuario, nome, email, cargo, status FROM tbUsuariosSistema";
    let params = [];

    if (search) {
        query += " WHERE nome LIKE ? OR email LIKE ? OR cargo LIKE ?";
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    query += " ORDER BY idUsuario DESC LIMIT ? OFFSET ?";
    params.push(limit, skip);

    const [rows] = await db.query(query, params);
    return rows;
}

export async function getTotalUsers(search = '') {
    let query = 'SELECT COUNT(*) as total FROM tbUsuariosSistema';
    let params = [];

    if (search) {
        query += " WHERE nome LIKE ? OR email LIKE ? OR cargo LIKE ?";
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    const [total] = await db.query(query, params);
    return total;
}

export async function createAdmin(data) {
    try {
        await db.query(
            `INSERT INTO tbUsuariosSistema (nome, email, cargo, status, pAdmin, pGerenciarCategorias, pGerenciarPedidos, senhaHash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [data.nome, data.email, data.cargo, data.status, data.isAdmin, data.manageCategories, data.manageSolicitations, data.senha] 
        );
        return true;
    } catch (err) {
        return err;
    }
}

export async function editAdmin(id, data, changePass, senhaHash) {
    const sql = `UPDATE tbUsuariosSistema
    SET nome = ?, email = ?, cargo = ?, status = ?, pAdmin = ?, pGerenciarCategorias = ?, pGerenciarPedidos = ? ${changePass}
    WHERE idUsuario = ?`;

    const args = [data.nome, data.email, data.cargo, data.status, data.isAdmin, data.manageCategories, data.manageSolicitations];
    if(changePass !== "") args.push(senhaHash);
    args.push(id);

    try {
        await db.query(
            sql,
            args
        );
        return true;
    } catch(err) {
        return err;
    }
}

export async function deleteAdmin(id) {
    try {
        await db.query(
            "DELETE FROM tbUsuariosSistema WHERE idUsuario = ?",
            [id]
        );
        return true;
    } catch(err) {
        return err;
    }
}