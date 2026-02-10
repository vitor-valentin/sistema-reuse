import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { getAnuncios, insertAnuncio } from "../models/anuncios.model.js";

export async function listarAnuncios(req, res) {
  try {
    const anuncios = await getAnuncios();
    return res.json(anuncios);
  } catch (err) {
    console.error("Erro ao listar anúncios:", err);
    return res.status(500).json({ error: "Erro ao buscar anúncios" });
  }
}

export async function criarAnuncio(req, res) {
  try {
    const token = req.cookies?.reuseToken;
    if (!token) {
      return res.status(401).json({ error: "Empresa não identificada. Faça login novamente." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Token inválido. Faça login novamente." });
    }

    // ✅ seu login gera payload { id: idEmpresa }
    const idEmpresa = decoded?.id;

    if (!idEmpresa) {
      return res.status(401).json({ error: "Empresa não identificada. Faça login novamente." });
    }

    const result = await insertAnuncio(idEmpresa, req.body, req.files);

    if (result === true) {
      return res.status(201).json({ message: "Anúncio publicado com sucesso!" });
    }

    return res.status(400).json({ error: result || "Erro ao salvar anúncio." });
  } catch (err) {
    console.error("Erro ao criar anúncio:", err);
    return res.status(500).json({ error: "Erro interno ao criar anúncio" });
  }
}
