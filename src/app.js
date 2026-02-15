import express from 'express';
import path from "path";
import cookieParser from 'cookie-parser';

import { publicDir } from './utils/paths.js';

import loginRoute from "./routes/login.route.js";
import cadastroRoute from "./routes/cadastro.route.js";
import forgotRoute from "./routes/forgot.route.js";
import adminRoute from "./routes/admin.route.js";

const app = express();

app.use(express.json());
app.use("/styles", express.static(path.join(publicDir , "styles")));
app.use("/fonts", express.static(path.join(publicDir , "fonts")));
app.use("/images", express.static(path.join(publicDir , "images")));
app.use("/scripts", express.static(path.join(publicDir , "scripts")));
app.use("/components", express.static(path.join(publicDir, "components")));
app.use(cookieParser());

app.use("/login", loginRoute);
app.use("/registrar", cadastroRoute);
app.use("/recuperar-senha", forgotRoute);
app.use("/admin", adminRoute);

export default app;