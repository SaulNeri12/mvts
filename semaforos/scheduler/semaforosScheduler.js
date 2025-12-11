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
        
        semaforos.forEach((semaforo, id) => {
            const estado = semaforo.getState();

            if (semaforo.getHoldState() !== "") {
                console.log(`[Scheduler] Semáforo ${id} en hold: ${semaforo.getHoldState()}. Salta ciclo automático.`);
                publishStateChange(id, estado);
                return;
            }

            // Publish current state, then advance the state machine so
            // the next interval will publish the following state.
            publishStateChange(id, estado);
            semaforo.next();
        });

    }, INTERVAL_MS);
}

module.exports = startSemaforosScheduler;