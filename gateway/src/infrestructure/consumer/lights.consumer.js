const RabbitClient = require('../../config/rabbit.config');

/**
 * Consumer for the lights queue.
 * Connects to RabbitMQ and consumes messages from the lights queue.
 */
class LightsConsumer {
  constructor() {
    this.queueName = 'lights';
    this.rabbitClient = new RabbitClient();
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
            processMessage(content);
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
    console.log(`Revived message from ${this.queueName}:`, content);
  }

  /**
   * Stop consuming messages and close the connection.
   */
//  async stopConsuming() {
//    try {
//      if (!this.isConsuming) {
//        console.warn('the consumer is not running');
//        return;
//      }
//
//      await this.rabbitClient.close();
//      this.isConsuming = false;
//      console.log('cosnumer stopped successfully');
//    } catch (err) {
//      console.error(`Error stopping ${this.queueName} consumer:`, err.message);
//    }
//  }
}

module.exports = new LightsConsumer();
