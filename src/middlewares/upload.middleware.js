import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import { srcDir } from "../utils/paths.js";

const BASE_UPLOAD_BATH = path.resolve(path.join(srcDir, "private_uploads"));

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        let subfolder = "misc";

        if (file.fieldname === "comprovante_end") subfolder = "comprovante_end";
        if (file.fieldname === "cartao_cnpj") subfolder = "cartao_cnpj";
        if (file.fieldname === "contrato_social") subfolder = "contrato_social";

        const finalPath = path.join(BASE_UPLOAD_BATH, subfolder);
        ensureDir(finalPath);

        cb(null, finalPath);
    },

    filename(req, file, cb) {
        const randomName = crypto.randomBytes(8).toString("hex");
        const ext = path.extname(file.originalname).toLowerCase;

        cb(null, `${randomName}${ext}`);
    }
});

function fileFilter(req, file, cb) {
    const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf"
    ];

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Invalid file type"), false);
    }

    cb(null, true);
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 8 * 1024 * 1024
    }
});