const amqp = require('amqplib');

/**
 * Lightweight RabbitMQ client with automatic reconnect and helper methods.
 */
class RabbitClient {

  /**
   * @param {String} uri AMQP connection string, defaults to `process.env.RABBIT_URL` or `amqp://localhost`
   * @param {Object} opts options: reconnectDelay (ms)
   */
  constructor(uri) {
    this.uri = uri;
    this.conn = null;
    this.channel = null;
    this.reconnectDelay = 5000;
    this.closing = false;
    this._connecting = null;
  }

  async connect() {
    if (this.channel && this.conn) return this.channel;
    if (this._connecting) return this._connecting;

    this._connecting = (async () => {
      try {
        this.conn = await amqp.connect(this.uri);
        this.conn.on('error', (err) => {
          // connection errors will be handled by 'close' event as well
          console.error('RabbitMQ connection error:', err && err.message);
        });

        this.conn.on('close', async () => {
          console.warn('RabbitMQ connection closed');
          this.conn = null;
          this.channel = null;
          if (!this.closing) await this._reconnect();
        });

        this.channel = await this.conn.createChannel();
        // default prefetch can be set by consumer code if needed
        return this.channel;
      } catch (err) {
        console.error('Failed to connect to RabbitMQ:', err && err.message);
        this.conn = null;
        this.channel = null;
        await this._delay(this.reconnectDelay);
        return this._reconnect();
      } finally {
        this._connecting = null;
      }
    })();

    return this._connecting;
  }

  async _reconnect() {
    if (this.closing) return null;
    try {
      await this._delay(this.reconnectDelay);
      return this.connect();
    } catch (e) {
      console.error('Reconnect attempt failed:', e && e.message);
      return this._reconnect();
    }
  }

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Returns a connected channel (creates connection if needed)
   */
  async getChannel() {
    if (this.channel) return this.channel;
    return this.connect();
  }

  /**
   * Create/ensure a queue and optionally bind it to an exchange
   */
  async assertQueue(queue, opts = { durable: true }, exchangeName, exchangeType, routingKey) {
    const ch = await this.getChannel();
    if (!ch) throw new Error('RabbitMQ channel not available');
    await ch.assertQueue(queue, opts);
    
    if (exchangeName && routingKey) {
      await ch.assertExchange(exchangeName, exchangeType, { durable: true });
      await ch.bindQueue(queue, exchangeName, routingKey);
    }
    return true;
  }

  /**
   * Close client and underlying connection gracefully
   */
  async close() {
    this.closing = true;
    try {
      if (this.channel) await this.channel.close();
    } catch (e) {
      // ignore
    }
    try {
      if (this.conn) await this.conn.close();
    } catch (e) {
      // ignore
    }
    this.channel = null;
    this.conn = null;
    this.closing = false;
  }
}

// export a class reference to instance outside
module.exports = RabbitClient;