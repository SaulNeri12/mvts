// /src/sockets/index.js
//const socketAuth = require('../middlewares/socketAuth');
//const telemetrySocket = require('./telemetry.socket');

let ioInstance = null;

/**
 * 
 * @param {Object} server server instance
 * @returns 
 */
function initSocket(server) {
    const { Server } = require('socket.io');
    const io = new Server(server, {
        cors: {
            origin: "*", // cámbialo a tu dominio
            methods: ["GET", "POST"]
        }
    });
    ioInstance = io;
    //io.use(socketAuth);
    //telemetrySocket(io);

    console.log("socket.io initialized");
}

/**
 * Get the IO instance
 * @returns IO instance
 */
function getIO() {      
    return ioInstance;
}

module.exports = { initSocket, getIO };
