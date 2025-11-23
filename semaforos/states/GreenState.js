// mvts/semaforos/states/GreenState.js
class GreenState {
    constructor (semaforo) {
        this.semaforo = semaforo;
    }

    next() {
        // Cambia al estado amarillo
        this.semaforo.setState(this.semaforo.yellow);
    }

    getName() {
        return 'verde';
    }
}

module.exports = GreenState;