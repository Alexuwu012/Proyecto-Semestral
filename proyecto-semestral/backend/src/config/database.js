const mongoose = require('mongoose');
require('dotenv').config();

// URI de conexión a MongoDB. Por defecto apunta a una instancia local
// (mongodb://127.0.0.1:27017/alerta_segura), pero puede sobreescribirse
// con la variable de entorno MONGO_URI (por ejemplo, para usar MongoDB Atlas
// o el contenedor de docker-compose incluido en este proyecto).
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alerta_segura';

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(`Conectado a MongoDB -> ${MONGO_URI}`);
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
}

module.exports = { connectDB, mongoose };
