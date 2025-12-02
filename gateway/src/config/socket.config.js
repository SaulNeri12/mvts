// /src/sockets/index.js
//const socketAuth = require('../middlewares/socketAuth');
//const telemetrySocket = require('./telemetry.socket');

let ioInstance = null;

function initSocket(server) {
    const { Server } = require('socket.io');
    const io = new Server(server, {
        cors: {
            origin: "*", // cámbialo a tu dominio
            methods: ["GET", "POST"]
        }
    });
    ioInstance = io;

    // Autenticación en handshake
    //io.use(socketAuth);

    // Registrar módulos de sockets por separado
    //telemetrySocket(io);

    console.log("socket.io initialized");
    return io;
}

// Exportar la instancia para usarla en otros módulos
function getIO() {
    return ioInstance;
}

module.exports = { initSocket, getIO };
