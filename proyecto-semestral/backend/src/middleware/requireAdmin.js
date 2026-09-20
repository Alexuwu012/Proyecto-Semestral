// Debe usarse DESPUÉS de authMiddleware, ya que depende de req.user.
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Prohibido',
            message: 'Esta acción requiere rol de administrador'
        });
    }
    next();
}

module.exports = requireAdmin;
