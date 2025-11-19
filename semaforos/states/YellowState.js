// mvts/semaforos/states/YellowState.js
class YellowState {
    constructor (semaforo) {
        this.semaforo = semaforo;
    }

    next() {
        // Cambia al estado rojo
        this.semaforo.setState(this.semaforo.red);
    }

    getName() {
        return 'amarillo';
    }
}

module.exports = YellowState;