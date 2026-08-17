const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: 'No autorizado',
            message: 'Se requiere un token de autenticación'
        });
    }

    const token = authHeader.replace('Bearer ', '');

    if (token !== 'alerta-segura-2026') {
        return res.status(401).json({
            error: 'No autorizado',
            message: 'Token de autenticación inválido'
        });
    }

    next();
};

module.exports = authMiddleware;