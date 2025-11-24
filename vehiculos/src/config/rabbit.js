// mvts/semaforos/messaging/rabbit.js
const amqp = require('amqplib');

const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
const RABBITMQ_USER = process.env.RABBITMQ_USER;
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD;
const QUEUE_NAME = 'vehiculos_outbox'; 

let channel;
let connection;

/**
 * Establish the connection for the queue
 * @returns 
 */
async function connectRabbit() {
    const amqpUrl = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:5672`;
    
    for (let i = 0; i < 10; i++) {
        try {
            connection = await amqp.connect(amqpUrl);
            channel = await connection.createChannel();
            
            // Make shure the queue exist
            await channel.assertQueue(QUEUE_NAME, { durable: true });

            console.log(`Conexión a RabbitMQ y cola '${QUEUE_NAME}' lista.`);
            return;
        } catch (error) {
            console.error(`Error de conexión a RabbitMQ, reintentando...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    throw new Error("Fallo al conectar a RabbitMQ después de 10 intentos.");
}

/**
 * Get the amqp chanel
 * @returns Chanel object
 */
exports.getChanel = ()=>{
    return channel
}

/**
 * Gets the connection
 * @returns Connection object
 */
exports.getConnection = ()=>{
    return connection
}

module.exports = connectRabbit