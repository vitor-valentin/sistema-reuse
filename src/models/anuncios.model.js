import { db } from "../config/database.js";

function parseCurrency(value) {
    if (!value) return null;
    const normalized = value.toString().replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    return Number.isNaN(parsed) ? null : parsed;
}

function mapCondicao(condicao) {
    const mapa = {
        "usado-funcional": "Usado - Funcional",
        sucata: "Usado - Não Funcional",
        novo: "Novo"
    };

    return mapa[condicao] || "Usado - Funcional";
}

function mapModalidade(modalidade) {
    const mapa = {
        agendamento: "Disponível para Agendamento",
        entrega: "Entrega Direta em Endereço",
        retirada: "Entrega Direta em Endereço"
    };

    return mapa[modalidade] || "Disponível para Agendamento";
}

async function resolveCategoriaId(tipo) {
    if (!tipo) return null;
    const [rows] = await db.query(
        "SELECT idCategoria FROM tbCategorias WHERE nome = ? LIMIT 1",
        [tipo]
    );

    if (rows.length > 0) return rows[0].idCategoria;

    const [result] = await db.query(
        "INSERT INTO tbCategorias (nome, descricao) VALUES (?, ?)",
        [tipo, `Categoria ${tipo}`]
    );

    return result.insertId;
}

export async function getAnuncios() {
    const sql = `
        SELECT 
            a.idAnuncio,
            a.nomeProduto,
            a.valorTotal,
            a.quantidade,
            a.unidadeMedida,
            a.pesoTotal,
            a.descricao,
            a.condicao,
            a.origem,
            a.composicao,
            a.status,
            e.nomeFantasia AS nomeEmpresa,
            i.nomeArquivo
        FROM tbanuncios a
        LEFT JOIN tbEmpresas e ON a.idEmpresa = e.idEmpresa
        LEFT JOIN tbImagensAnuncios i ON i.idAnuncio = a.idAnuncio
        WHERE a.status = 'ativo'
        GROUP BY a.idAnuncio
        ORDER BY a.dataStatus DESC
    `;

    const [rows] = await db.query(sql);
    return rows;
}

export async function insertAnuncio(data, files = []) {
    try {
        const categoriaId = await resolveCategoriaId(data.tipo);

        if (!categoriaId) return "Categoria não encontrada.";

        const valorTotal = parseCurrency(data.valorTotal);
        const quantidade = Number.parseInt(data.quantidade, 10);
        const pesoTotal = Number.parseInt(data.pesoTotal, 10) || 0;

        const [result] = await db.query(
            `INSERT INTO tbAnuncios (
                idEmpresa,
                nomeProduto,
                valorTotal,
                quantidade,
                unidadeMedida,
                pesoTotal,
                descricao,
                idCategoria,
                condicao,
                origem,
                composicao,
                modalidadeColeta,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                null,
                data.nomeProduto,
                valorTotal,
                quantidade,
                data.unidadeMedida,
                pesoTotal,
                data.descricao,
                categoriaId,
                mapCondicao(data.condicao),
                data.origem || null,
                data.composicao || null,
                mapModalidade(data.modalidadeColeta),
                "ativo"
            ]
        );

        if (files.length > 0) {
            const values = files.map((file) => [result.insertId, file.filename]);
            await db.query(
                "INSERT INTO tbImagensAnuncios (idAnuncio, nomeArquivo) VALUES ?",
                [values]
            );
        }

        return true;
    } catch (err) {
        return err.message;
    }
}
