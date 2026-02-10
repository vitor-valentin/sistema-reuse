import { db } from "../config/database.js";

function parseCurrency(value) {
  if (value === undefined || value === null || value === "") return null;

  const normalized = value
    .toString()
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

function mapCondicao(condicao) {
  const mapa = {
    "usado-funcional": "Usado - Funcional",
    sucata: "Usado - Não Funcional",
    novo: "Novo",
  };
  return mapa[condicao] || "Usado - Funcional";
}

function mapModalidade(modalidade) {
  const mapa = {
    agendamento: "Disponível para Agendamento",
    entrega: "Entrega no Local",
    retirada: "Retirada Imediata",
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
      a.dataStatus,
      e.nomeFantasia AS nomeEmpresa,
      img.nomeArquivo
    FROM tbAnuncios a
    LEFT JOIN tbEmpresas e 
      ON a.idEmpresa = e.idEmpresa
    LEFT JOIN (
      SELECT i1.idAnuncio, i1.nomeArquivo
      FROM tbImagensAnuncios i1
      INNER JOIN (
        SELECT idAnuncio, MIN(idImagem) AS minIdImagem
        FROM tbImagensAnuncios
        GROUP BY idAnuncio
      ) x ON x.idAnuncio = i1.idAnuncio AND x.minIdImagem = i1.idImagem
    ) img ON img.idAnuncio = a.idAnuncio
    WHERE a.status = 'ativo'
    ORDER BY a.dataStatus DESC
  `;

  const [rows] = await db.query(sql);
  return rows;
}

/**
 * @param {number} idEmpresa - idEmpresa da empresa logada
 * @param {object} data - dados do form (req.body)
 * @param {Array} files - arquivos do multer (req.files)
 */
export async function insertAnuncio(idEmpresa, data, files = []) {
  try {
    if (!idEmpresa) {
      return "Empresa não identificada. Faça login novamente.";
    }

    // Se seu select manda "placas/cabos/metais" no campo name="tipo",
    // isso funciona perfeito:
    const categoriaId = await resolveCategoriaId(data.tipo);
    if (!categoriaId) return "Categoria não encontrada.";

    const valorTotal = parseCurrency(data.valorTotal);

    const quantidade = Number.parseInt(data.quantidade, 10);
    if (!Number.isFinite(quantidade) || quantidade < 0) {
      return "Quantidade inválida.";
    }

    const pesoTotal = Number.parseFloat(
      (data.pesoTotal ?? "").toString().replace(",", ".")
    );
    const pesoFinal = Number.isFinite(pesoTotal) && pesoTotal >= 0 ? pesoTotal : 0;

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
        idEmpresa,
        data.nomeProduto,
        valorTotal,
        quantidade,
        data.unidadeMedida,
        pesoFinal,
        data.descricao,
        categoriaId,
        mapCondicao(data.condicao),
        data.origem || null,
        data.composicao || null,
        mapModalidade(data.modalidadeColeta),
        "ativo",
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
