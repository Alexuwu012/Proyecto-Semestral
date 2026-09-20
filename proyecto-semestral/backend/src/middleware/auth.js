const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cambia-este-secreto-en-produccion';

// Verifica el JWT enviado en "Authorization: Bearer <token>" y adjunta
// el payload decodificado (id, role, name, email) a req.user.
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'No autorizado',
            message: 'Se requiere un token de autenticación'
        });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'No autorizado',
            message: 'Token inválido o expirado'
        });
    }
}

module.exports = authMiddleware;
module.exports.JWT_SECRET = JWT_SECRET;
