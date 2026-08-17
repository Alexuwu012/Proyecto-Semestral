const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

let reports = [];

// GET /reports con paginación
router.get('/', (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
        return res.status(400).json({
            error: 'Parámetros inválidos',
            message: 'page y limit deben ser números mayores que 0'
        });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedReports = reports.slice(startIndex, endIndex);

    res.json({
        page,
        limit,
        total: reports.length,
        totalPages: Math.ceil(reports.length / limit),
        reports: paginatedReports
    });
});

// POST /reports
// Ruta protegida con autenticación
router.post('/', authMiddleware, (req, res) => {
    const report = {
        id: reports.length + 1,
        description: req.body.description,
        location: req.body.location,
        photo: req.body.photo,
        status: 'pending'
    };

    reports.push(report);

    res.status(201).json(report);
});

// GET /reports/:id
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const report = reports.find(report => report.id === id);

    if (!report) {
        return res.status(404).json({
            message: 'Reporte no encontrado'
        });
    }

    res.json(report);
});

// PUT /reports/:id
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const report = reports.find(report => report.id === id);

    if (!report) {
        return res.status(404).json({
            message: 'Reporte no encontrado'
        });
    }

    report.description = req.body.description;
    report.location = req.body.location;
    report.photo = req.body.photo;
    report.status = req.body.status || report.status;

    res.json(report);
});

// DELETE /reports/:id
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const index = reports.findIndex(report => report.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: 'Reporte no encontrado'
        });
    }

    reports.splice(index, 1);

    res.status(204).send();
});

module.exports = router;