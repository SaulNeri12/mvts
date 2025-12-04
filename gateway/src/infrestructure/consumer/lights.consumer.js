const RabbitClient = require('../../config/rabbit.config');
const lightsController = require('../../controllers/lights.controller')
/**
 * Consumer for the lights queue.
 * Connects to RabbitMQ and consumes messages from the lights queue.
 */
class LightsConsumer {
  constructor() {
      this.queueName = 'queue.cambio.estados.semaforo';
      this.exchangeName = 'exchange.semaforos.estado';
      this.routingKey = 'queue.cambio.estados.semaforo';
      this.rabbitClient = new RabbitClient('amqp://guest:guest@rabbitmq:5672');
      this.exchangeType = 'fanout';
      this.isConsuming = false;
  }

  /**
   * Start consuming messages from the lights queue.
   */
  async startConsuming() {
    try {
      if (this.isConsuming) {
        console.warn('consumer is already running');
        return;
      }

      // Ensure queue exists
      await this.rabbitClient.assertQueue(this.queueName, { durable: true }, this.exchangeName, this.exchangeType, this.routingKey);


        // Get channel and set prefetch
      const ch = await this.rabbitClient.getChannel();
      await ch.prefetch(1); // Process one message at a time

      // Start consuming
      this.isConsuming = true;
      await ch.consume(this.queueName, (msg) => {
        if (!msg) return;

        try {
            const content = msg.content.toString();
            this.processMessage(content);
            ch.ack(msg); // Acknowledge the message

          } catch (err) {
            console.error(`Error processing message from ${this.queueName}:`, err.message);
            ch.nack(msg, false, true); // Requeue the message
          }
      });

      console.log(`${this.queueName} consumer started successfully`);
    } catch (err) {
      console.error(`Failed to start ${this.queueName} consumer:`, err.message);
      this.isConsuming = false;
    }
  }

  async processMessage(content) {
    lightsController.handleLightsMessage(content);
  }

}

module.exports = new LightsConsumer();
