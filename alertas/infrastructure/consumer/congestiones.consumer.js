const RabbitClient = require('../../config/rabbit.config');

const alertService = require('../../services/alert.service');

const alertPublisher = require('../publisher/alert.viajes.publisher');

const uuid = require("uuid");

class CongestionesConsumer {

  constructor() {
    this.queueName = '';
    this.exchangeName = 'exchange.vehiculos.congestiones';
    this.routingKey = '';
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
        if (!msg) return null; 

        try {
            const content = JSON.parse(msg.content.toString());
            this.processMessage(content);
            ch.ack(msg); // Acknowledge the message
        } catch (err) {
            console.error(`Error processing message from ${this.queueName}:`, err.message);
            //ch.nack(msg, false, true); // Requeue the message
        }
      });

      console.log(`[congestiones] ${this.queueName} consumer started successfully`);
    } catch (err) {
      console.error(`Failed to start ${this.queueName} consumer:`, err.message);
      this.isConsuming = false;
    }
  }

  /**
   * Procesa la informacion de la congestion para almacenarla y retransmitirla a los
   * consumidores Socket.io interesados.
   * @param {object} content Contiene la informacion de la alerta recibida.
   */
  async processMessage(content) {
    try {
      console.log("ALERTAS SERVICE -> recibido");
      //console.log(content);

      /*
      id_vehiculo: str
      latitud: float
      longitud: float
      timestamp_inicio: str 
      duracion_segundos: int
      motivo: str = "Detenido tras luz verde"
      */

      let event = {
          vehicle_id: content['id_vehiculo'],
          latitude: content['latitud'],
          longitude: content['longitud'],
          timestamp_start: content['timestamp_inicio'],
          duration_secs: content['duracion_segundos'],
          reason: content['motivo']
      };

      let alert = {
        id: uuid.v4(),
        type: 'congestion',
        title: `El vehículo ${event.vehicle_id} se encuentra en una congestión`,
        data: event,
        timestamp: new Date()
      };

      console.log(alert);

      alertPublisher.publish(alert);

      await alertService.saveAlert(alert);

    } catch (err) {
      console.error('Error in congestiones.consumer.js:', err.message);
    }
  }

}

module.exports = new CongestionesConsumer();
