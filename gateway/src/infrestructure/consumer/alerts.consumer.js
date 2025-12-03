const RabbitClient = require('../../config/rabbit.config');

/**
 * Consumer for the alerts queue.
 * Connects to RabbitMQ and consumes messages from the alerts queue.
 */
class AlertsConsumer {
  constructor() {
    this.queueName = 'alerts';
    this.rabbitClient = new RabbitClient();
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

      // Ensure queue exists
      await this.rabbitClient.assertQueue(this.queueName, { durable: true });

      // Get channel and set prefetch
      const ch = await this.rabbitClient.getChannel();
      await ch.prefetch(1); // Process one message at a time

      // Start consuming
      this.isConsuming = true;
      await ch.consume(this.queueName, (msg) => {
        if (!msg) return;

        try {
            const content = JSON.parse(msg.content.toString());

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
module.exports = new AlertsConsumer();
