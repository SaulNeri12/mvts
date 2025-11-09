const connectDB = require('../config/db'); // o la ruta donde tengas db.js
const mongoose = require('mongoose');
const loadRepository = require('../repositories/loadRepository');



async function testGetAllLoads() {
  console.log('Running getAllLoads test...');
  try {
    //Conectamos a Mongo
    await connectDB();

    console.log("Base conectada:", mongoose.connection.name);
    console.log("URI:", mongoose.connection.host + "/" + mongoose.connection.name);
    
    //Ejecutamos el test
    const loads = await loadRepository.getAll();
    console.log('getAllLoads Test Passed:', loads);
  } catch (error) {  
    console.error('getAllLoads Test Failed:', error.message);
  } finally {
    // 🔹 3️⃣ Cerramos la conexión al final
    await mongoose.disconnect();
  }
}

testGetAllLoads();
