
const RabbitClient = require('../../config/rabbit.config');

class ViajesCompletadosPublisher {

    constructor() {
        this.exchangeName = 'exchange.alertas.viajes.completados';
        this.exchangeType = 'fanout';
        this.rabbitClient = new RabbitClient('amqp://guest:guest@rabbitmq:5672');
        this.initialized = false;
    }

    /**
     * Asegura que el Exchange exista. Debe llamarse al iniciar el servicio.
     */
    async initialize() {
        if (this.initialized) {
            console.warn(`Publisher ${this.exchangeName} ya está inicializado.`);
            return;
        }

        try {
            const ch = await this.rabbitClient.getChannel();
            if (!ch) throw new Error('RabbitMQ channel no disponible');
            
            await ch.assertExchange(this.exchangeName, this.exchangeType, { durable: true });
            
            this.initialized = true;
            console.log(`[PUB] Exchange ${this.exchangeName} asegurado.`);
        } catch (err) {
            console.error(`[PUB] Error inicializando Publisher ${this.exchangeName}:`, err.message);
            throw err;
        }
    }

    /**
     * Publica un mensaje en el Exchange.
     * @param {Object} message El mensaje a enviar (será convertido a JSON y Buffer).
     * @param {String} routingKey Clave de enrutamiento (si el Exchange no es 'fanout').
     * @returns {Boolean} True si se publicó con éxito.
     */
    async publish(message, routingKey = '') {
        try {
            if (!this.initialized) {
                // Opcional: Re-inicializar si no se hizo previamente
                await this.initialize(); 
            }
            
            const ch = await this.rabbitClient.getChannel();
            if (!ch) throw new Error('Canal de RabbitMQ no disponible para publicar.');

            const buffer = Buffer.from(JSON.stringify(message));

            const published = ch.publish(
                this.exchangeName, 
                routingKey, 
                buffer, 
                { persistent: true }
            );

            if (published) {
                console.log(`[PUB] Mensaje publicado a ${this.exchangeName}`);
            } else {
                console.warn(`[PUB] Mensaje NO publicado (buffer lleno) en ${this.exchangeName}`);
            }
            return published;

        } catch (err) {
            console.error(`[PUB] Error publicando mensaje en ${this.exchangeName}:`, err.message);
            return false;
        }
    }
}

module.exports = new ViajesCompletadosPublisher();