CREATE DATABASE IF NOT EXISTS dbReuse;
USE dbReuse;

------------------------------------------------------------
-- TABELA: tbEmpresas
------------------------------------------------------------
CREATE TABLE tbEmpresas (
    idEmpresa INT AUTO_INCREMENT PRIMARY KEY,
    ikPublica TEXT NOT NULL,
    ikPrivada TEXT NOT NULL,
    salt TEXT NOT NULL,
    iv TEXT NOT NULL,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    razaoSocial VARCHAR(144) UNIQUE NOT NULL,
    nomeFantasia VARCHAR(55) UNIQUE,
    emailCorporativo VARCHAR(255) UNIQUE NOT NULL,
    foneCorporativo VARCHAR(11) UNIQUE NOT NULL,
    nomeResponsavel VARCHAR(80) NOT NULL,
    cpfResponsavel VARCHAR(11) UNIQUE NOT NULL,
    senhaHash VARCHAR(255) NOT NULL,
    cepEmpresa VARCHAR(8) NOT NULL,
    estado VARCHAR(18) NOT NULL,
    cidade VARCHAR(40) NOT NULL,
    bairro VARCHAR(50) NOT NULL,
    endereco VARCHAR(70) NOT NULL,
    numEndereco VARCHAR(6) NOT NULL,
    compEndereco VARCHAR(120),
    docComprovanteEndereco VARCHAR(120) UNIQUE NOT NULL,
    docCartaoCNPJ VARCHAR(120) UNIQUE NOT NULL,
    docContratoSocial VARCHAR(120) UNIQUE,
    descricao TEXT,
    dataCadastro DATETIME NOT NULL,
    cadastroAtivo BOOLEAN NOT NULL,
    dataAprovacao DATETIME DEFAULT NULL
);

------------------------------------------------------------
-- TABELA: tbConfigEmpresas
------------------------------------------------------------
CREATE TABLE tbConfigEmpresas (
    idConfig INT AUTO_INCREMENT PRIMARY KEY,
    idEmpresa INT NOT NULL,
    notMsgEmpresas BOOLEAN NOT NULL DEFAULT TRUE,
    notAttAnuncios BOOLEAN NOT NULL DEFAULT TRUE,
    privPerfilPrivado BOOLEAN NOT NULL DEFAULT FALSE,
    privMostrarEmail BOOLEAN NOT NULL DEFAULT TRUE,
    privMostrarFone BOOLEAN NOT NULL DEFAULT TRUE,
    privMostrarEndCompleto BOOLEAN NOT NULL DEFAULT FALSE,
    privMostrarCNPJ BOOLEAN NOT NULL DEFAULT FALSE,
    privMostrarRazaoSocial BOOLEAN NOT NULL DEFAULT TRUE,
    segAutDuasEtapas BOOLEAN NOT NULL DEFAULT FALSE,
    aparenciaTema INT NOT NULL DEFAULT 1,
    FOREIGN KEY (idEmpresa) REFERENCES tbEmpresas(idEmpresa)
        ON DELETE CASCADE
);

------------------------------------------------------------
-- TABELA: tbConversas
------------------------------------------------------------
CREATE TABLE tbConversas (
    idConversa BIGINT AUTO_INCREMENT PRIMARY KEY,
    idEmpresa1 INT NOT NULL,
    idEmpresa2 INT NOT NULL,
    FOREIGN KEY (idEmpresa1) REFERENCES tbEmpresas(idEmpresa)
        ON DELETE CASCADE,
    FOREIGN KEY (idEmpresa2) REFERENCES tbEmpresas(idEmpresa)
        ON DELETE CASCADE
);

------------------------------------------------------------
-- TABELA: tbMensagens
------------------------------------------------------------
CREATE TABLE tbMensagens (
    idMensagem BIGINT AUTO_INCREMENT PRIMARY KEY,
    idConversa BIGINT NOT NULL,
    idRemetente INT NOT NULL,
    idDestinatario INT NOT NULL,
    conteudoCriptografado TEXT NOT NULL,
    dataEnvio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    entregue BOOLEAN NOT NULL DEFAULT FALSE,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (idConversa) REFERENCES tbConversas(idConversa)
        ON DELETE CASCADE,
    FOREIGN KEY (idRemetente) REFERENCES tbEmpresas(idEmpresa)
        ON DELETE CASCADE,
    FOREIGN KEY (idDestinatario) REFERENCES tbEmpresas(idEmpresa)
        ON DELETE CASCADE
);

------------------------------------------------------------
-- TABELA: tbUsuariosSistema
------------------------------------------------------------
CREATE TABLE tbUsuariosSistema (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(70) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    cargo VARCHAR(40) NOT NULL,
    status BOOLEAN NOT NULL,
    pAdmin BOOLEAN NOT NULL,
    pGerenciarCategorias BOOLEAN NOT NULL,
    pGerenciarPedidos BOOLEAN NOT NULL,
    senhaHash VARCHAR(255) NOT NULL
);

------------------------------------------------------------
-- TABELA: tbNotificacoes
------------------------------------------------------------
CREATE TABLE tbNotificacoes (
    idNotificacao INT AUTO_INCREMENT PRIMARY KEY,
    idEmpresa INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    dataLida DATETIME,
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo VARCHAR(40) NOT NULL,
    lida TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (idEmpresa) REFERENCES tbEmpresas(idEmpresa)
        ON DELETE CASCADE
);

------------------------------------------------------------
-- TABELA: tbCategorias
------------------------------------------------------------
CREATE TABLE tbCategorias (
    idCategoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    descricao TEXT NOT NULL,
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- TABELA: tbAnuncios
------------------------------------------------------------
CREATE TABLE tbAnuncios (
    idAnuncio BIGINT AUTO_INCREMENT PRIMARY KEY,
    idEmpresa INT,
    nomeProduto VARCHAR(120) NOT NULL,
    valorTotal DECIMAL(13,2),
    quantidade INT NOT NULL,
    unidadeMedida VARCHAR(30) NOT NULL,
    pesoTotal INT NOT NULL,
    descricao TEXT NOT NULL,
    idCategoria INT NOT NULL,
    condicao ENUM("Novo", "Usado - Funcional", "Usado - Não Funcional") NOT NULL,
    origem VARCHAR(60),
    composicao VARCHAR(120),
    modalidadeColeta ENUM("Disponível para Agendamento", "Entrega Direta em Endereço") NOT NULL,
    status ENUM("ativo", "pausado", "vendido") NOT NULL,
    dataStatus DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idEmpresa) REFERENCES tbEmpresas(idEmpresa)
        ON DELETE CASCADE,
    FOREIGN KEY (idCategoria) REFERENCES tbCategorias(idCategoria)
);

------------------------------------------------------------
-- TABELA: tbImagensAnuncios
------------------------------------------------------------
CREATE TABLE tbImagensAnuncios (
    idImagem BIGINT AUTO_INCREMENT PRIMARY KEY,
    idAnuncio BIGINT NOT NULL,
    nomeArquivo VARCHAR(100) NOT NULL,
    dataUpload DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idAnuncio) REFERENCES tbAnuncios(idAnuncio)
        ON DELETE CASCADE
);

------------------------------------------------------------
-- TABELA: tbVisualizacoesAnuncios
------------------------------------------------------------
CREATE TABLE tbVisualizacoesAnuncios (
    idVisualizacao BIGINT AUTO_INCREMENT PRIMARY KEY,
    idAnuncio BIGINT NOT NULL,
    idEmpresa INT NOT NULL,
    dataVisualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idAnuncio) REFERENCES tbAnuncios(idAnuncio)
        ON DELETE CASCADE,
    FOREIGN KEY (idEmpresa) REFERENCES tbEmpresas(idEmpresa)
        ON DELETE CASCADE
);

------------------------------------------------------------
-- TABELA: tbCodigosVerificacao
------------------------------------------------------------
CREATE TABLE tbCodigosVerificacao (
    idCodigo INT AUTO_INCREMENT PRIMARY KEY,
    idEmpresa INT NOT NULL,
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    dataExpiracao DATETIME,
    tipo ENUM("2fauth", "change-pass"),
    codigo VARCHAR(6),
    FOREIGN KEY (idEmpresa) REFERENCES tbEmpresas(idEmpresa)
        ON DELETE CASCADE
);

------------------------------------------------------------
-- TABELA: tbTempoRespostaEmpresas
------------------------------------------------------------

CREATE TABLE tbTempoRespostaEmpresas (
    idEmpresa INT PRIMARY KEY,
    tempoRespostaMedio INT,
    FOREIGN KEY (idEmpresa) REFERENCES tbEmpresas(idEmpresa)
        ON DELETE CASCADE
);

------------------------------------------------------------
-- PROCEDURE: calcTempoRespostaPerfil
------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE calcTempoRespostaPerfil()
BEGIN
    TRUNCATE tbTempoRespostaEmpresas;

    INSERT INTO tbTempoRespostaEmpresas (idEmpresa, tempoRespostaMedio)
    SELECT 
        e.idEmpresa,
        ROUND(AVG(TIMESTAMPDIFF(
            MINUTE,
            m1.dataEnvio,
            (
                SELECT m2.dataEnvio
                FROM tbMensagens m2
                WHERE m2.idConversa = m1.idConversa
                AND m2.idRemetente = m1.idDestinatario
                AND m2.dataEnvio > m1.dataEnvio
                ORDER BY m2.dataEnvio
                LIMIT 1
            )
        )))
    FROM tbEmpresas e
    LEFT JOIN tbConversas cv 
        ON cv.idEmpresa1 = e.idEmpresa OR cv.idEmpresa2 = e.idEmpresa
    LEFT JOIN tbMensagens m1 
        ON m1.idConversa = cv.idConversa
        AND m1.idRemetente != e.idEmpresa
    GROUP BY e.idEmpresa;
END$$

DELIMITER ;


CREATE VIEW viewPerfilEmpresas AS
SELECT 
    e.idEmpresa,
    COALESCE(e.nomeFantasia, e.razaoSocial) AS nomeEmpresa,
    CASE c.privMostrarEndCompleto
        WHEN TRUE THEN CONCAT(e.estado, ', ', e.cidade, ', ', e.bairro, ', ', e.endereco, ', ', e.numEndereco)
        ELSE CONCAT(e.estado, ', ', e.cidade)
    END AS enderecoEmpresa,
    DATE_FORMAT(e.dataCadastro, '%Y-%m') AS membroDesde,
    (SELECT COUNT(*) FROM tbAnuncios a WHERE a.idEmpresa = e.idEmpresa AND a.status = 'ativo') AS anunciosAtivos,
    (SELECT COUNT(*) FROM tbAnuncios a WHERE a.idEmpresa = e.idEmpresa AND a.status = 'vendido') AS vendasRealizadas,
    (
        SELECT 
            ROUND(
                (SUM(CASE WHEN m.idRemetente = e.idEmpresa THEN 1 ELSE 0 END)
                / NULLIF(COUNT(*), 0)) * 100
            )
        FROM tbMensagens m
        JOIN tbConversas cv ON cv.idConversa = m.idConversa
        WHERE cv.idEmpresa1 = e.idEmpresa OR cv.idEmpresa2 = e.idEmpresa
    ) AS taxaResposta,
    t.tempoRespostaMedio AS tempoResposta,
    CASE WHEN c.privMostrarEmail = TRUE THEN e.emailCorporativo ELSE NULL END AS emailEmpresa,
    CASE WHEN c.privMostrarFone = TRUE THEN e.foneCorporativo ELSE NULL END AS foneEmpresa,
    e.descricao AS sobreEmpresa
FROM tbEmpresas e
LEFT JOIN tbConfigEmpresas c ON c.idEmpresa = e.idEmpresa
LEFT JOIN tbTempoRespostaEmpresas t ON t.idEmpresa = e.idEmpresa;

------------------------------------------------------------
-- VIEW: viewMeusAnuncios
------------------------------------------------------------
CREATE VIEW viewMeusAnuncios AS
SELECT 
    e.idEmpresa,
    (SELECT COUNT(*) 
     FROM tbVisualizacoesAnuncios v
     JOIN tbAnuncios a ON a.idAnuncio = v.idAnuncio
     WHERE a.idEmpresa = e.idEmpresa
     AND MONTH(v.dataVisualizacao) = MONTH(CURRENT_DATE())
     AND YEAR(v.dataVisualizacao) = YEAR(CURRENT_DATE())
    ) AS visualizacoesMensais,
    (SELECT COUNT(*) 
     FROM tbAnuncios a
     WHERE a.idEmpresa = e.idEmpresa
     AND a.status = 'vendido'
     AND MONTH(a.dataStatus) = MONTH(CURRENT_DATE())
     AND YEAR(a.dataStatus) = YEAR(CURRENT_DATE())
    ) AS vendasMes,
    (SELECT COUNT(*) 
     FROM tbAnuncios a
     WHERE a.idEmpresa = e.idEmpresa
     AND a.status = 'ativo'
    ) AS anunciosAtivos
FROM tbEmpresas e;

------------------------------------------------------------
-- VIEW: viewVisualizacoesSemana
------------------------------------------------------------
CREATE VIEW viewVisualizacoesSemana AS
SELECT 
    e.idEmpresa,
    SUM(CASE WHEN DAYOFWEEK(v.dataVisualizacao) = 1 THEN 1 ELSE 0 END) AS dom,
    SUM(CASE WHEN DAYOFWEEK(v.dataVisualizacao) = 2 THEN 1 ELSE 0 END) AS seg,
    SUM(CASE WHEN DAYOFWEEK(v.dataVisualizacao) = 3 THEN 1 ELSE 0 END) AS ter,
    SUM(CASE WHEN DAYOFWEEK(v.dataVisualizacao) = 4 THEN 1 ELSE 0 END) AS qua,
    SUM(CASE WHEN DAYOFWEEK(v.dataVisualizacao) = 5 THEN 1 ELSE 0 END) AS qui,
    SUM(CASE WHEN DAYOFWEEK(v.dataVisualizacao) = 6 THEN 1 ELSE 0 END) AS sex,
    SUM(CASE WHEN DAYOFWEEK(v.dataVisualizacao) = 7 THEN 1 ELSE 0 END) AS sab
FROM tbEmpresas e
LEFT JOIN tbAnuncios a ON a.idEmpresa = e.idEmpresa
LEFT JOIN tbVisualizacoesAnuncios v ON v.idAnuncio = a.idAnuncio
WHERE YEARWEEK(v.dataVisualizacao, 1) = YEARWEEK(CURRENT_DATE(), 1)
GROUP BY e.idEmpresa;

------------------------------------------------------------
-- VIEW: viewFiltroBusca
------------------------------------------------------------
CREATE VIEW viewFiltroBusca AS
SELECT 
    a.idAnuncio,
    a.idCategoria,
    a.condicao,
    COALESCE(a.valorTotal, 0) AS precoTotal,
    e.cidade AS cidadeEmpresa,
    e.estado AS estadoEmpresa
FROM tbAnuncios a
JOIN tbEmpresas e ON e.idEmpresa = a.idEmpresa;

------------------------------------------------------------
-- VIEW: viewVendasUltimos6Meses
------------------------------------------------------------
CREATE VIEW viewVendasUltimos6Meses AS
SELECT 
    DATE_FORMAT(dataStatus, '%Y-%m') AS mesAno,
    COUNT(*) AS totalVendido
FROM tbAnuncios
WHERE status = 'vendido'
  AND dataStatus >= DATE_SUB(LAST_DAY(CURRENT_DATE()), INTERVAL 6 MONTH)
GROUP BY DATE_FORMAT(dataStatus, '%Y-%m')
ORDER BY mesAno ASC;

------------------------------------------------------------
-- VIEW: viewItensAnunciadosUltimas4Semanas
------------------------------------------------------------
CREATE VIEW viewItensAnunciadosUltimas4Semanas AS
SELECT 
    CONCAT(YEAR(dataStatus), '-', WEEK(dataStatus, 1)) AS anoSemana,
    COUNT(*) AS totalAnunciado
FROM tbAnuncios
WHERE status = 'ativo'
  AND dataStatus >= DATE_SUB(CURRENT_DATE(), INTERVAL 4 WEEK)
GROUP BY CONCAT(YEAR(dataStatus), '-', WEEK(dataStatus, 1))
ORDER BY anoSemana ASC;

------------------------------------------------------------
-- VIEW: viewItensAnunciadosUltimas5Semanas
------------------------------------------------------------
CREATE OR REPLACE VIEW viewItensAnunciadosUltimas5Semanas AS
SELECT 
    CONCAT(YEAR(dataStatus), '-', WEEK(dataStatus, 1)) AS anoSemana,
    COUNT(*) AS totalAnunciado
FROM tbAnuncios
WHERE status = 'ativo'
  AND dataStatus >= DATE_SUB(CURRENT_DATE(), INTERVAL 5 WEEK)
GROUP BY anoSemana
ORDER BY anoSemana ASC;

------------------------------------------------------------
-- VIEW: viewDensidadePorEstado
------------------------------------------------------------
CREATE VIEW viewDensidadePorEstado AS
SELECT 
    e.estado,
    COUNT(a.idAnuncio) AS totalAnuncios
FROM tbEmpresas e
JOIN tbAnuncios a ON e.idEmpresa = a.idEmpresa
WHERE a.status = 'ativo'
GROUP BY e.estado
ORDER BY totalAnuncios DESC;

------------------------------------------------------------
-- VIEW: viewFunilConversaoTotal
------------------------------------------------------------
CREATE VIEW viewFunilConversaoTotal AS
SELECT 
    'Visualizações' AS etapa,
    COUNT(*) AS quantidade
FROM tbVisualizacoesAnuncios
UNION ALL
SELECT 
    'Interesses (Chat)' AS etapa,
    COUNT(DISTINCT idConversa) AS quantidade
FROM tbMensagens;

------------------------------------------------------------
-- VIEW: viewItensPorCategoriaTop5
------------------------------------------------------------
CREATE VIEW viewItensPorCategoriaTop5 AS
(
    SELECT 
        c.nome AS categoria,
        COUNT(a.idAnuncio) AS totalAtivos
    FROM tbCategorias c
    INNER JOIN tbAnuncios a ON c.idCategoria = a.idCategoria
    WHERE a.status = 'ativo'
    GROUP BY c.idCategoria
    ORDER BY totalAtivos DESC
    LIMIT 5
)
UNION ALL
(
    SELECT 
        'Outros' AS categoria,
        SUM(totalAtivos) as totalAtivos
    FROM (
        SELECT COUNT(a.idAnuncio) AS totalAtivos
        FROM tbCategorias c
        INNER JOIN tbAnuncios a ON c.idCategoria = a.idCategoria
        WHERE a.status = 'ativo'
        GROUP BY c.idCategoria
        ORDER BY totalAtivos DESC
        OFFSET 5 ROWS FETCH NEXT 999999 ROWS ONLY
    ) AS subquery
    HAVING totalAtivos > 0
);

------------------------------------------------------------
-- TRIGGER: criar config padrão ao registrar empresa
------------------------------------------------------------
DELIMITER $$
CREATE TRIGGER tgCreateConfigEmpresa
AFTER INSERT ON tbEmpresas
FOR EACH ROW
BEGIN
    INSERT INTO tbConfigEmpresas (idEmpresa)
    VALUES (NEW.idEmpresa);
END$$
DELIMITER ;

------------------------------------------------------------
-- TRIGGER: atualizar dataStatus ao mudar status
------------------------------------------------------------
DELIMITER $$
CREATE TRIGGER tgUpdateDataStatus
BEFORE UPDATE ON tbAnuncios
FOR EACH ROW
BEGIN
    IF NEW.status <> OLD.status THEN
        SET NEW.dataStatus = CURRENT_TIMESTAMP;
    END IF;
END$$
DELIMITER ;