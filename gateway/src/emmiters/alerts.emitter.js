const {io} = require('../../server'); // Import the io instance

/**
 * Emit alerts update to connected clients via Socket.IO
 * @param {Object} alertData Message received from alerts queue 
 */
exports.alertsUpdate = (alertData) => {
    try{
        io.emit('alerts:update', alertData);
    }
    catch (error){
        console.log('Error emitting alerts update:', error);
    }
}