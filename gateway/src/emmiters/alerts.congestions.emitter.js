const { getIO } = require('../config/socket.config'); // Import the io instance

/**
 * Emit alerts update to connected clients via Socket.IO
 * @param {Object} alertData Message received from alerts queue 
 */
exports.alertCongestiones = (alertData) => {
    try{
        const io = getIO();
        io.emit('congestion', alertData);
    }
    catch (error){
        console.log('Error emitting alerts update:', error);
    }
}