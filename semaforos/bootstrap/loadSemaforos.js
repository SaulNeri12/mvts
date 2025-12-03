// mvts/semaforos/bootstrap/loadSemaforos.js
const Semaforo = require('../domain/Semaforo');
const { semaforos } = require('../store/semaforosStore');
const SemaforoModel = require('../models/SemaforoModel'); 

async function loadSemaforos() {
    try {
        console.log('Cargando semáforos estáticos desde MongoDB...');
        const docs = await SemaforoModel.find().lean();
        
        docs.forEach(doc => {
            //const id = doc._id.toString();
            const code = doc.code.toString();
            const sem = new Semaforo(code);

            // Almacena la instancia en el mapa
            semaforos.set(code, sem);
        });

        console.log(`${semaforos.size} semáforos cargados a memoria.`);
    } catch (error) {
        console.error('Error durante la carga de semáforos:', error.message);
        throw error;
    }
}

module.exports = loadSemaforos;