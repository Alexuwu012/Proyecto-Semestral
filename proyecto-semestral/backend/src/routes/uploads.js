const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, unique);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_SIZE },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return cb(new Error('Formato no permitido. Usa JPG, PNG o WebP.'));
        }
        cb(null, true);
    }
});

// POST /uploads -> requiere estar autenticado; sube UNA imagen ("photo")
// y devuelve la URL pública para guardarla en el reporte.
router.post('/', authMiddleware, (req, res) => {
    upload.single('photo')(req, res, (err) => {
        if (err) {
            const message =
                err.code === 'LIMIT_FILE_SIZE'
                    ? 'La imagen supera el tamaño máximo de 5 MB.'
                    : err.message;
            return res.status(400).json({ error: message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ninguna imagen.' });
        }
        res.status(201).json({ url: `/uploads/${req.file.filename}` });
    });
});

module.exports = router;
