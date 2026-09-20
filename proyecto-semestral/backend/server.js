const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./src/middleware/logger');
const { connectDB } = require('./src/models');

const authRouter = require('./src/routes/auth');
const reportsRouter = require('./src/routes/reports');
const usersRouter = require('./src/routes/users');
const uploadsRouter = require('./src/routes/uploads');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Sirve las fotos subidas como archivos estáticos (ej: /uploads/foo.jpg)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/auth', authRouter);
app.use('/reports', reportsRouter);
app.use('/users', usersRouter);
app.use('/uploads', uploadsRouter);

app.get('/', (req, res) => {
    res.json({
        message: 'Alerta Segura API (MongoDB)'
    });
});

// Manejador de errores centralizado (por si algo no fue capturado en las rutas)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Conecta a MongoDB y luego levanta el servidor
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
});
