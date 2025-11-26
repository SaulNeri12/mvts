const rabbitConfig = require('../config/rabbit')

/**
 * Publish a CRUD change in the queue.
 * @param {String} transaction indicates the type of crud change
 * @param {Object} response object whith the transaction change
 * @returns 
 */
function publishChange(transaction, response) {
    const channel = rabbitConfig.getChanel();
    if (!channel) return console.error(`Canal de RabbitMQ no disponible.`);

    const message = JSON.stringify({ 
        transaction, 
        response, 
    });

    try {
        channel.sendToQueue( 
            QUEUE_NAME,
            Buffer.from(message),
            { persistent: true } 
        );
    } catch (e) {
        console.error(`Error publicando mensaje: `, e.message);
    }
}
