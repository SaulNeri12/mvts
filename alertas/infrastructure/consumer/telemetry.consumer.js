const RabbitClient = require('../../config/rabbit.config');

/**
 * Consumer for the telemetry queue.
 * Connects to RabbitMQ and consumes messages from the telemetry queue.
 */
class TelemetryConsumer {

  constructor() {
    this.queueName = 'queue.telemetria.vehiculos.posiciones';
    this.exchangeName = 'exchange.telemetria.vehiculos.posiciones';
    this.routingKey = 'queue.telemetria.vehiculos.posiciones';
    this.rabbitClient = new RabbitClient('amqp://guest:guest@rabbitmq:5672');
    this.exchangeType = 'fanout';
    this.isConsuming = false;
  }

  /**
   * Start consuming messages from the telemetry queue.
   */
  async startConsuming() {
    try {
      if (this.isConsuming) {
        console.warn(`${this.queueName} consumer is already running`);
        return;
      }

      // Ensure queue exists
      await this.rabbitClient.assertQueue(this.queueName, { durable: true }, this.exchangeName, this.exchangeType, this.routingKey);

      // Get channel and set prefetch
      const ch = await this.rabbitClient.getChannel();
      await ch.prefetch(1);

      // Start consuming
      this.isConsuming = true;
      await ch.consume(this.queueName, (msg) => {
        if (!msg) return null; 

        try {
            const content = msg.content.toString();
            this.processMessage(content);
            ch.ack(msg); // Acknowledge the message
        } catch (err) {
            console.error(`Error processing message from ${this.queueName}:`, err.message);
            //ch.nack(msg, false, true); // Requeue the message
        }
      });

      console.log(`${this.queueName} consumer started successfully`);
    } catch (err) {
      console.error(`Failed to start ${this.queueName} consumer:`, err.message);
      this.isConsuming = false;
    }
  }

  async processMessage(content) {
    try {
      console.log("ALERTAS SERVICE -> recibido");
      console.log(content);
    } catch (err) {
      console.error('Error in telemetry.consumer.js:', err.message);
    }
  }

}

// Export singleton instance
module.exports = new TelemetryConsumer();
