

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
}