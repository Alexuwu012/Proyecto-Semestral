const express = require('express');
const authMiddleware = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const { Report } = require('../models');

const router = express.Router();

// Convierte { lat, lng } que manda el frontend al formato GeoJSON de Mongo.
function buildGeo(body) {
    const lat = parseFloat(body.lat);
    const lng = parseFloat(body.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { type: 'Point', coordinates: [lng, lat] };
    }
    return undefined;
}

// GET /reports?page=1&limit=10  -> lista con paginación
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
        return res.status(400).json({
            error: 'Parámetros inválidos',
            message: 'page y limit deben ser números mayores que 0'
        });
    }

    try {
        const total = await Report.countDocuments();
        const reports = await Report.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'name email');

        res.json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            reports
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /reports/map -> todos los reportes que tienen coordenadas, para el mapa
router.get('/map', async (req, res) => {
    try {
        const reports = await Report.find({ 'geo.coordinates': { $exists: true } })
            .select('description location status geo createdAt userId')
            .populate('userId', 'name email');
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /reports  -> requiere estar autenticado (cualquier usuario logueado)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const report = await Report.create({
            description: req.body.description,
            location: req.body.location,
            photo: req.body.photo,
            geo: buildGeo(req.body),
            userId: req.user.id,
            status: 'pending'
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Consulta 1: reportes filtrados por status y ordenados por fecha de creación
router.get('/query/by-status', async (req, res) => {
    try {
        const status = req.query.status;
        const order = req.query.order === 'asc' ? 1 : -1;

        const filter = status ? { status } : {};

        const filteredReports = await Report.find(filter)
            .sort({ createdAt: order })
            .populate('userId', 'name email');

        res.json(filteredReports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Consulta 2: reportes de un usuario específico, ordenados por descripción
router.get('/query/by-user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const order = req.query.order === 'desc' ? -1 : 1;

        const userReports = await Report.find({ userId })
            .sort({ description: order })
            .populate('userId', 'name email');

        res.json(userReports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /reports/:id
router.get('/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).populate('userId', 'name email');

        if (!report) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        res.json(report);
    } catch (error) {
        res.status(404).json({ message: 'Reporte no encontrado' });
    }
});

// PUT /reports/:id -> actualizar datos del reporte.
// Cambiar el "status" (aprobar / marcar en progreso / resolver) SOLO lo puede
// hacer un administrador. El resto de campos los puede editar el autor o un admin.
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        const isOwner = report.userId && report.userId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                error: 'Prohibido',
                message: 'No tienes permiso para editar este reporte'
            });
        }

        if (req.body.status !== undefined && req.body.status !== report.status && !isAdmin) {
            return res.status(403).json({
                error: 'Prohibido',
                message: 'Solo un administrador puede cambiar el estado de un reporte'
            });
        }

        report.description = req.body.description ?? report.description;
        report.location = req.body.location ?? report.location;
        report.photo = req.body.photo ?? report.photo;
        if (isAdmin && req.body.status) report.status = req.body.status;
        const geo = buildGeo(req.body);
        if (geo) report.geo = geo;

        await report.save();

        res.json(report);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PATCH /reports/:id/status -> endpoint dedicado, exclusivo de administradores,
// para cambiar el estado de un reporte (aprobar/gestionar denuncias).
router.patch('/:id/status', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'in_progress', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('userId', 'name email');

        if (!report) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        res.json(report);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /reports/:id -> autor o admin
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        const isOwner = report.userId && report.userId.toString() === req.user.id;
        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Prohibido',
                message: 'No tienes permiso para eliminar este reporte'
            });
        }

        await report.deleteOne();
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
