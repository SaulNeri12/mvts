// mvts/semaforos/messaging/rabbit.js
const amqp = require('amqplib');
const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost';
const RABBITMQ_USER = process.env.RABBITMQ_USER || 'guest';
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || 'guest';
const QUEUE_NAME = 'cambio_estado_semaforo'; 

let channel;
let connection;

/**
 * sirve para dirigir los eventos al servicio de telemetria
 */
const SEMAFOROS_ESTADO_EXCHANGE = process.env.SEMAFOROS_ESTADO_EXCHANGE || 'exchange.semaforos.estado';

async function connectRabbit() {
    const amqpUrl = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:5672`;
    
    for (let i = 0; i < 10; i++) {
        try {
            connection = await amqp.connect(amqpUrl);
            channel = await connection.createChannel();
            
            // Asegura que la cola exista
            //await channel.assertQueue(QUEUE_NAME, { durable: true });

            await channel.assertExchange(SEMAFOROS_ESTADO_EXCHANGE, 'fanout', { durable: true });

            console.log(`Conexión a RabbitMQ y cola '${QUEUE_NAME}' lista.`);
            return;
        } catch (error) {
            console.error(`Error de conexión a RabbitMQ, reintentando...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    throw new Error("Fallo al conectar a RabbitMQ después de 10 intentos.");
}

function publishStateChange(id, estado) {
    if (!channel) return console.error(`Canal de RabbitMQ no disponible.`);

    const message = JSON.stringify({ 
        id, 
        estado, 
        ts: Date.now() 
    });

    try {
        // publica mensajes al exchange, no a una cola...
        channel.publish(
            SEMAFOROS_ESTADO_EXCHANGE,
            '',
            Buffer.from(message),
            { persistent: true } 
        );
        console.log(`Publicado: Semáforo ${id} -> ${estado}`);
    } catch (e) {
        console.error(`Error publicando mensaje para ${id}:`, e.message);
    }
}

module.exports = { connectRabbit, publishStateChange };