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

    return query(sql);
}