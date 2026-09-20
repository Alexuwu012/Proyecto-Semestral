const express = require('express');
const authMiddleware = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const { User } = require('../models');

const router = express.Router();

// GET /users -> solo administradores pueden ver el listado completo de usuarios
router.get('/', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ name: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /users/:id/role -> un admin puede promover/degradar a otro usuario
router.patch('/:id/role', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Rol inválido' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
