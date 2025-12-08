// mvts/semaforos/scheduler/semaforosScheduler.js
const { semaforos } = require('../store/semaforosStore');
const { publishStateChange } = require('../messaging/rabbit');

const INTERVAL_MS = 12000; 

function startSemaforosScheduler() {
    console.log(`Scheduler iniciado. Intervalo de actualización: ${INTERVAL_MS / 1000}s`);

    // Inicia el temporizador para la actualización periódica
    setInterval(() => {
        if (semaforos.size === 0) {
            return;
        }
        
        // Itera sobre el mapa de semáforos
        semaforos.forEach((semaforo, id) => {
            semaforo.next(); // Cambia al siguiente estado
            const nuevoEstado = semaforo.getState();
            
            // Envía evento a RabbitMQ
            publishStateChange(id, nuevoEstado);
        });

    }, INTERVAL_MS);
}

module.exports = startSemaforosScheduler;