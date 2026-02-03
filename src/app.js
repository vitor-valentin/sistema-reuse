import express from 'express';
import path from "path";
import { publicDir } from './utils/paths.js';
import loginRoute from "./routes/login.route.js"
import landingPageRoute from "./routes/landingPage.route.js"
import anuncieRoute from "./routes/anuncie.route.js"
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.static(publicDir));
app.use(express.json());
app.use(express.static(path.join(publicDir)));
app.use(cookieParser());

app.use("/login", loginRoute);
app.use("/", landingPageRoute);
app.use("/anuncie", anuncieRoute);

let sessaoAtiva = false; 

app.get('/api/verificar-login', (req, res) => {
    res.json({ logado: sessaoAtiva });
});

app.post('/api/login', (req, res) => {
    sessaoAtiva = true; 
    res.send("Login realizado!");
});

export default app;