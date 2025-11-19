// mvts/semaforos/domain/Semaforo.js
const GreenState = require('../states/GreenState');
const YellowState = require('../states/YellowState');
const RedState = require('../states/RedState');

class Semaforo {
    constructor (id) {
        this.id = id;
        // Instancias de los estados
        this.green = new GreenState(this);
        this.yellow = new YellowState(this);
        this.red = new RedState(this);

        // Estado inicial
        this.currentState = this.green;
    }

    setState(state) {
        this.currentState = state;
    }

    next() {
        // Ejecuta la lógica del estado actual
        this.currentState.next();
    }

    getState() {
        return this.currentState.getName();
    }
}

module.exports = Semaforo;