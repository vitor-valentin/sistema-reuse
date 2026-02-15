import { db } from "../config/database.js";

export async function getMonthTotalMessages() {
    const [rows] = await db.query(
        `SELECT 
            COUNT(CASE WHEN dataEnvio >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END) AS total_mes_atual,
            ROUND(
                ((COUNT(CASE WHEN dataEnvio >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END) - 
                COUNT(CASE WHEN dataEnvio >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01') 
                            AND dataEnvio < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END))
                / NULLIF(COUNT(CASE WHEN dataEnvio >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01') 
                                    AND dataEnvio < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END), 0)) * 100, 
            2) AS percentual_crescimento
        FROM tbMensagens
        WHERE dataEnvio >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01');`
    );
    return rows;
}