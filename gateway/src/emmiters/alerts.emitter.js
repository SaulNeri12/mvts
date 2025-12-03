const {getIO} = require('../config/socket.config'); // Import the io instance

/**
 * Emit alerts update to connected clients via Socket.IO
 * @param {Object} alertData Message received from alerts queue 
 */
exports.alertsUpdate = (alertData) => {
    try{
        const io = getIO();
        io.emit('alerts_update', alertData);
    }
    catch (error){
        console.log('Error emitting alerts update:', error);
    }
}