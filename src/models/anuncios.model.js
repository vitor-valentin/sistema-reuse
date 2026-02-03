<<<<<<< HEAD


export async function getAnuncios() {
  const sql = `
    SELECT 
      a.idAnuncio,
      a.nomeProduto,
      a.valorTotal,
      a.descricao,
      i.nomeArquivo
    FROM tbAnuncios a
    LEFT JOIN tbImagensAnuncios i 
      ON i.idAnuncio = a.idAnuncio
    WHERE a.status = 'ativo'
    GROUP BY a.idAnuncio
    ORDER BY a.dataStatus DESC
  `;

  return query(sql);
=======
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
>>>>>>> 29f052cbf8024306d2632f6a8f3b1c3a3eea19a3
}