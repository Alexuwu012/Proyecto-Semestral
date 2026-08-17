const express = require('express');
const logger = require('./src/middleware/logger');

const reportsRouter = require('./src/routes/reports');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(logger);

app.use('/reports', reportsRouter);

app.get('/', (req, res) => {
    res.json({
        message: 'Hello API'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});