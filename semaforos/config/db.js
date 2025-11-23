// mvts/semaforos/config/db.js
const mongoose = require('mongoose'); 
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource: 'admin'
    });
    console.log('Conexión a MongoDB exitosa para Semáforos');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    throw error;
  }
};

module.exports = connectDB;