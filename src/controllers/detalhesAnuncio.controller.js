import path from "path";

import { publicDir } from "../utils/paths.js";

export default {
    async getPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/detalhesAnuncio.html"));
    }
};