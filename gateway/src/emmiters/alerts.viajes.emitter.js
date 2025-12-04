const { getIO } = require('../config/socket.config'); // Import the io instance

/**
 * Emit alerts update to connected clients via Socket.IO
 * @param {Object} alertData Message received from alerts queue 
 */
exports.alertViajeCompletado = (alertData) => {
    try{
        const io = getIO();
        io.emit('viaje_completado', alertData);
    }
    catch (error){
        console.log('Error emitting alerts update:', error);
    }
}