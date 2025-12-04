const RabbitClient = require('../../config/rabbit.config');

/**
 * Consumer for the alerts queue.
 * Connects to RabbitMQ and consumes messages from the alerts queue.
 */
class AlertasViajesCompletadosConsumer {
  constructor() {
    this.queueName = '';
    this.exchangeName = 'exchange.alertas.viajes.completados';
    this.routingKey = '';
    this.exchangeType = 'fanout';
    this.rabbitClient = new RabbitClient('amqp://guest:guest@rabbitmq:5672');
    this.isConsuming = false;
  }

  /**
   * Start consuming messages from the alerts queue.
   */
  async startConsuming() {
    try {
      if (this.isConsuming) {
        console.warn(`${this.queueName} consumer is already running`);
        return;
      }

      const ch = await this.rabbitClient.getChannel();

      await ch.assertExchange(this.exchangeName, this.exchangeType, { durable: true });

      const q = await ch.assertQueue('', { exclusive: true });
      this.queueName = q.queue;

      await ch.bindQueue(this.queueName, this.exchangeName, '');
      console.log(`[CONSUMER] Escuchando en ${this.exchangeName} con cola temporal: ${this.queueName}`);

     
      await ch.prefetch(1);

      // Start consuming
      this.isConsuming = true;
      await ch.consume(this.queueName, (msg) => {
        if (!msg) return;

        try {
            const content = JSON.parse(msg.content.toString());
            this.processMessage(content);
            ch.ack(msg);
        } catch (err) {
            console.error(`Error processing message from ${this.queueName}:`, err.message);
            ch.nack(msg, false, true);
        }
      });

      console.log(`${this.queueName} consumer started successfully`);
    } catch (err) {
      console.error(`Failed to start ${this.queueName} consumer:`, err.message);
      this.isConsuming = false;
    }
  }

  async processMessage(content) {
    console.log(`Received message from ${this.queueName}:`, content);

  }

  /**
   * Stop consuming messages and close the connection.
   */
//  async stopConsuming() {
//    try {
//      if (!this.isConsuming) {
//        console.warn(`${this.queueName} consumer is not running`);
//        return;
//      }
//
//      await this.rabbitClient.close();
//      this.isConsuming = false;
//      console.log(`${this.queueName} consumer stopped`);
//    } catch (err) {
//      console.error(`Error stopping ${this.queueName} consumer:`, err.message);
//    }
//  }
}

// Export singleton instance
module.exports = new AlertasViajesCompletadosConsumer();
