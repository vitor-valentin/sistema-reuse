import { db } from "../config/database.js";

export async function getCountAnunciosCategoria(idCategoria) {
    const [rows] = await db.query(
        "SELECT COUNT(*) AS total FROM tbAnuncios WHERE idCategoria = ?",
        [idCategoria]
    );
    return rows;
}

export async function getTotalAnuncios() {
    const [rows] = await db.query(
        `SELECT 
            COUNT(CASE WHEN status = 'ativo' THEN 1 END) AS total_atual,
            ROUND(
                ((COUNT(CASE WHEN status = 'ativo' THEN 1 END) - 
                COUNT(CASE WHEN status = 'ativo' AND dataStatus < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END))
                / NULLIF(COUNT(CASE WHEN status = 'ativo' AND dataStatus < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END), 0)) * 100, 
            2) AS percentual_crescimento
        FROM tbAnuncios;`
    );
    return rows;
}

export async function getWeeklyAnnounced() {
    const [rows] = await db.query(
        'SELECT * FROM viewItensAnunciadosUltimas4Semanas'
    );
    return rows;
}

export async function getSemesterSold() {
    const [rows] = await db.query(
        'SELECT * FROM viewVendasUltimos6Meses'
    );
    return rows;
}

export async function getAnunciosPerState() {
    const [rows] = await db.query(
        'SELECT * FROM viewDensidadePorEstado'
    );
    return rows;
}

export async function getAnunciosPerCategory() {
    const [rows] = await db.query(
        'SELECT * FROM viewItensPorCategoriaTop5'
    );
    return rows;
}