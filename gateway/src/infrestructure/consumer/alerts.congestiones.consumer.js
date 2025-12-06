const RabbitClient = require('../../config/rabbit.config');

const alertsController = require('../../controllers/alerts.controller');

/**
 * Consumer for the alerts queue.
 * Connects to RabbitMQ and consumes messages from the alerts queue.
 */
class AlertasCongestionesConsumer {
  constructor() {
    this.queueName = '';
    this.exchangeName = 'exchange.alertas.congestiones';
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
    console.log(`[congestiones] Received message from ${this.queueName}:`, content);
    await alertsController.handleCongestionesAlerts(content)
  }
}

module.exports = new AlertasCongestionesConsumer();
