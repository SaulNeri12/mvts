
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('debug', true);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        mongoose.connection.on('error', (err) => {
            console.error('⚠️ Mongoose Error (Runtime):', err);
        });
        mongoose.connection.on('disconnected', () => {
            console.error('❌ Mongoose Desconectado. La consulta se colgará.');
        });

        console.log('Reportes Service: Conectado a MongoDB');
    } catch (error) {
        console.error('Error conectando a MongoDB:', error.message);
        // No matamos el proceso para que pueda reintentar o seguir sirviendo API
    }
};

module.exports = connectDB;