// src/utils/adminSeeder.js

import Admin from '../models/Admin.js'; // Importamos el modelo Admin
// No necesitamos importar bcrypt aquí porque la función .pre('save')
// en el modelo Admin ya maneja el hasheo de la contraseña.

const DEFAULT_ADMIN_CREDENTIALS = {
    correo: 'administrador@gmail.com',
    password: 'admin123',
    // Los siguientes campos son requeridos por tu modelo Admin.js,
    // así que usamos valores por defecto para el seeding inicial.
    nombre: 'Admin',
    apellido: 'Sistema',
    cedula: '9999999999',
    telefono: '999999999',
    verificado: true,
    rol: 'administrador'
};

export const seedDefaultAdmin = async () => {
    try {
        // 1. Verificar si el administrador por defecto ya existe
        const adminExists = await Admin.findOne({ 
            correo: DEFAULT_ADMIN_CREDENTIALS.correo 
        });

        if (!adminExists) {
            console.log('⏳ Creando administrador por defecto...');

            // 2. Crear el nuevo administrador. 
            // La función .pre('save') en Admin.js se encargará de hashear la contraseña.
            await Admin.create(DEFAULT_ADMIN_CREDENTIALS);

            console.log('✅ Administrador por defecto creado: administrador@gmail.com / admin123');
        } else {
            console.log('✅ Administrador por defecto ya existe. Omite el seeding.');
        }
    } catch (error) {
        console.error('❌ Error al inicializar el administrador por defecto:', error.message);
        // Aquí podrías considerar que un error grave detenga el servidor
        // throw error; 
    }
};