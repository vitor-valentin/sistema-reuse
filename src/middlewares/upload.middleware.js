import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import { srcDir } from "../utils/paths.js";

const BASE_UPLOAD_PATH = path.resolve(path.join(srcDir, "public", "imagens_produto"));

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        ensureDir(BASE_UPLOAD_PATH);
        cb(null, BASE_UPLOAD_PATH);
    },

    filename(req, file, cb) {
        const randomName = crypto.randomBytes(12).toString("hex");
        const ext = path.extname(file.originalname).toLowerCase();

        cb(null, `produto-${randomName}${ext}`);
    }
});

function fileFilter(req, file, cb) {
    const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Apenas imagens (JPG, PNG, WEBP) são permitidas!"), false);
    }

    cb(null, true);
}

export const uploadAnuncio = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 
    }
});