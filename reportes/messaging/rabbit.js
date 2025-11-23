
const amqp = require('amqplib');
const Reporte = require('../models/Reporte');

// Nombres de las colas definidos por los otros servicios :v
const QUEUE_CONGESTIONES = 'congestiones';
const QUEUE_VIAJES = 'viajes_completados_vehiculos';

const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost';
const RABBITMQ_USER = process.env.RABBITMQ_USER || 'guest';
const RABBITMQ_PASS = process.env.RABBITMQ_PASSWORD || 'guest';

async function startRabbitConsumer() {
    const amqpUrl = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}:5672`;

    try {
        const connection = await amqp.connect(amqpUrl);
        const channel = await connection.createChannel();

        // 1. Asegurar y consumir cola de CONGESTIONES
        await channel.assertQueue(QUEUE_CONGESTIONES, { durable: true });
        console.log(`Escuchando cola: ${QUEUE_CONGESTIONES}`);

        channel.consume(QUEUE_CONGESTIONES, async (msg) => {
            if (msg !== null) {
                try {
                    const contenido = JSON.parse(msg.content.toString());

                    // Guardar en BD
                    await Reporte.create({
                        tipo: 'congestion',
                        datos: contenido
                    });

                    console.log('[Congestión] Reporte guardado.');
                    channel.ack(msg); // Confirmar procesado
                } catch (err) {
                    console.error('Error procesando mensaje de congestión:', err);

                }
            }
        });

        // 2. Asegurar y consumir cola de VIAJES COMPLETADOS
        await channel.assertQueue(QUEUE_VIAJES, { durable: true });
        console.log(`🐰 Escuchando cola: ${QUEUE_VIAJES}`);

        channel.consume(QUEUE_VIAJES, async (msg) => {
            if (msg !== null) {
                try {
                    const contenido = JSON.parse(msg.content.toString());

                    // Guardar en BD
                    await Reporte.create({
                        tipo: 'viaje_completado',
                        datos: contenido
                    });

                    console.log('[Viaje] Reporte guardado.');
                    channel.ack(msg);
                } catch (err) {
                    console.error('Error procesando mensaje de viaje:', err);
                }
            }
        });

    } catch (error) {
        console.error('Error conectando a RabbitMQ (Reportes):', error.message);
        setTimeout(startRabbitConsumer, 5000); // Reintento en caso de que no jale jsjs
    }
}

module.exports = startRabbitConsumer;