import { db } from "../config/database.js";

export async function getVisualizationsByInteractions() {
    const [rows] = await db.query(
        'SELECT * FROM viewFunilConversaoTotal'
    );
    return rows;
}

export async function getWeeklyVisualizations() {
    const [rows] = await db.query(
        `SELECT 
            COALESCE(SUM(dom), 0) AS dom,
            COALESCE(SUM(seg), 0) AS seg,
            COALESCE(SUM(ter), 0) AS ter,
            COALESCE(SUM(qua), 0) AS qua,
            COALESCE(SUM(qui), 0) AS qui,
            COALESCE(SUM(sex), 0) AS sex,
            COALESCE(SUM(sab), 0) AS sab
        FROM viewVisualizacoesSemana;`
    );
    return rows;
}