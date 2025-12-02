const {io} = require('../../server'); // Import the io instance

/**
 * Emit telemetry update to connected clients via Socket.IO
 * @param {Object} lightData Data received from lights queue 
 */
exports.lightsUpdate = (lightData) => {
    try{
        io.emit('lights:update', lightData);
    }
    catch (error){
        console.log('Error emitting lights update:', error);
    }
}