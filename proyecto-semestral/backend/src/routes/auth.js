const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
    return jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// POST /auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'name, email y password son obligatorios'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Contraseña débil',
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({
                error: 'Usuario existente',
                message: 'Ya existe una cuenta con ese correo'
            });
        }

        // Solo el primer usuario del sistema se crea como admin automáticamente;
        // el resto entra como "user". Los admins adicionales los promueve un admin.
        const isFirstUser = (await User.countDocuments()) === 0;

        const user = await User.create({
            name,
            email,
            password,
            role: isFirstUser ? 'admin' : 'user'
        });

        const token = signToken(user);

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'email y password son obligatorios'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const match = await user.comparePassword(password);
        if (!match) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = signToken(user);

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /auth/me -> devuelve el usuario autenticado (útil para el frontend al recargar)
router.get('/me', require('../middleware/auth'), async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

module.exports = router;
