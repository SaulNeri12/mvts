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
        // Ejecuta la lógica del estado actual (ciclo normal)
        this.currentState.next();
    }

    getState() {
        return this.currentState.getName();
    }

    /**
     * NUEVO: Permite forzar un estado manualmente.(me lo pidio el neri)
     * Acepta texto ('verde', 'rojo') o números (0, 1, 2).
     */
    forceState(input) {
        const val = String(input).toLowerCase().trim();

        if (['verde', 'green', '0'].includes(val)) {
            this.setState(this.green);
            return 'verde';
        }
        if (['amarillo', 'yellow', '1'].includes(val)) {
            this.setState(this.yellow);
            return 'amarillo';
        }
        if (['rojo', 'red', '2'].includes(val)) {
            this.setState(this.red);
            return 'rojo';
        }

        throw new Error(`Estado inválido: ${input}. Use 'verde', 'amarillo' o 'rojo'.`);
    }
}

module.exports = Semaforo;