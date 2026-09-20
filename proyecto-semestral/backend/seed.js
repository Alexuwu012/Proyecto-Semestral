const { connectDB, mongoose, User, Report } = require('./src/models');

async function seed() {
    await connectDB();

    // Limpia las colecciones (equivalente a sync({ force: true }) de Sequelize)
    await User.deleteMany({});
    await Report.deleteMany({});

    // Usuario administrador: puede gestionar el estado de los reportes.
    const admin = await User.create({
        name: 'Administrador',
        email: 'admin@alertasegura.com',
        password: 'admin123',
        role: 'admin'
    });

    const user1 = await User.create({
        name: 'Valentina Gómez',
        email: 'valentina@example.com',
        password: 'valentina123',
        role: 'user'
    });
    const user2 = await User.create({
        name: 'Carlos Ruiz',
        email: 'carlos@example.com',
        password: 'carlos123',
        role: 'user'
    });

    // Coordenadas de ejemplo en Ibagué, Tolima (Colombia)
    await Report.create({
        description: 'Poste de luz dañado',
        location: 'Calle 10 #5-20, Ibagué',
        status: 'pending',
        userId: user1._id,
        geo: { type: 'Point', coordinates: [-75.2322, 4.4389] }
    });
    await Report.create({
        description: 'Fuga de agua',
        location: 'Carrera 7 #12-33, Ibagué',
        status: 'resolved',
        userId: user1._id,
        geo: { type: 'Point', coordinates: [-75.2189, 4.4335] }
    });
    await Report.create({
        description: 'Bache grande en la vía',
        location: 'Avenida 3 #45-10, Ibagué',
        status: 'pending',
        userId: user2._id,
        geo: { type: 'Point', coordinates: [-75.2401, 4.4459] }
    });
    await Report.create({
        description: 'Semáforo dañado',
        location: 'Calle 20 #8-15, Ibagué',
        status: 'in_progress',
        userId: user2._id,
        geo: { type: 'Point', coordinates: [-75.2270, 4.4402] }
    });

    console.log('Datos de prueba insertados correctamente.');
    console.log('');
    console.log('Cuentas de acceso:');
    console.log(`  Admin:  ${admin.email} / admin123`);
    console.log(`  Usuario: ${user1.email} / valentina123`);
    console.log(`  Usuario: ${user2.email} / carlos123`);

    await mongoose.connection.close();
    process.exit();
}

seed().catch((err) => {
    console.error('Error al insertar datos de prueba:', err);
    process.exit(1);
});
