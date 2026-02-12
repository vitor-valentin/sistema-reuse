import express from 'express';
import path from "path";
import { publicDir } from './utils/paths.js';
import loginRoute from "./routes/login.route.js"
import landingPageRoute from "./routes/landingPage.route.js"
import anuncieRoute from "./routes/anuncie.route.js"
import cookieParser from 'cookie-parser';
import anunciosRouter from "./routes/anuncios.route.js";
import configuracoesRoute from "./routes/configuracoes.route.js";
import logoutRoute from "./routes/logout.route.js";
import detalhesRoute from "./routes/detalhesAnuncio.route.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));
app.use(express.json());
app.use(express.static(path.join(publicDir)));
app.use(cookieParser());
app.use(anunciosRouter);
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public", "uploads"))
);

app.use("/auth", logoutRoute);
app.use("/api", configuracoesRoute);
app.use("/login", loginRoute);
app.use("/", landingPageRoute);
app.use("/anuncie", anuncieRoute);
app.use("/uploads", express.static("uploads"));
app.use("/configuracoes", configuracoesRoute);
app.use("/detalhes", detalhesRoute);

let sessaoAtiva = false; 

app.get('/api/verificar-login', (req, res) => {
    res.json({ logado: sessaoAtiva });
});

app.post('/api/login', (req, res) => {
    sessaoAtiva = true; 
    res.send("Login realizado!");
});

export default app;