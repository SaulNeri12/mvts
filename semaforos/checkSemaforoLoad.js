// Importamos las dependencias necesarias
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const SemaforoModel = require('./models/SemaforoModel');

async function checkSemaforoLoad() {
    console.log('==================================================');
    console.log('         INICIANDO PRUEBA DE CARGA DE SEMÁFOROS         ');
    console.log('==================================================');

    try {
        // 1. Conectar a MongoDB
        console.log('1. Intentando conectar a MongoDB...');
        await connectDB(); // Utiliza la función de conexión existente

        // Si la conexión es exitosa, Mongoose está listo.

        console.log(`2. Conexión exitosa. Base de datos: ${mongoose.connection.name}`);

        // 3. Consultar la colección 'semaforos'
        // El modelo Semaforo se mapea a la colección 'semaforos'
        console.log("3. Consultando la colección 'semaforos'...");

        const docs = await SemaforoModel.find().lean();

        console.log('------------------ RESULTADO -------------------');
        if (docs.length > 0) {
            console.log(`✅ ¡ÉXITO! Se encontraron ${docs.length} semáforos.`);
            console.log('Primer documento encontrado:', JSON.stringify(docs[0], null, 2));
        } else {
            console.log('❌ FALLO: No se encontró ningún semáforo (0 documentos).');
            console.log('Asegúrese de haber insertado documentos en la base de datos "semaforos-db" y la colección "semaforos".');
        }
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('🔴 PRUEBA FALLIDA:', error.message);
        if (error.name === 'MongooseError') {
            console.error('Asegúrese que la variable MONGO_URL en .env o docker-compose.yml sea correcta.');
        }
    } finally {
        // 4. Desconectar al finalizar
        console.log('4. Cerrando conexión a MongoDB...');
        await mongoose.disconnect();
        console.log('==================================================');
    }
}

checkSemaforoLoad();