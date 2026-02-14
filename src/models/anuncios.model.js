import { db } from "../config/database.js";

export async function getCountAnunciosCategoria(idCategoria) {
    const [rows] = await db.query(
        "SELECT COUNT(*) AS total FROM tbAnuncios WHERE idCategoria = ?",
        [idCategoria]
    );
    return rows;
}