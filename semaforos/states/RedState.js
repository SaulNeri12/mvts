// mvts/semaforos/states/RedState.js
class RedState {
    constructor (semaforo) {
        this.semaforo = semaforo;
    }

    next() {
        // Ciclo: Rojo vuelve a Verde
        this.semaforo.setState(this.semaforo.green);
    }

    getName() {
        return 'rojo';
    }
}

module.exports = RedState;