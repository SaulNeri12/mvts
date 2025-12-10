const {getIO} = require('../config/socket.config'); // Import the io instance

/**
 * Emit telemetry update to connected clients via Socket.IO
 * @param {Object} lightData Data received from lights queue 
 */
exports.lightsUpdate = (lightData) => {
    try{
        const io = getIO();
        io.emit('lights_update', lightData);
    }
    catch (error){
        console.log('Error emitting lights update:', error);
    }
}

exports.emitLightTaken = async(lightData) =>
{
    try{
        const io = getIO();
        io.emit('light_taken_update', lightData);
    }
    catch (error){
        console.log('Error emitting light taken update:', error);
    }
} 


exports.emitLightFreed = async(lightData) =>
{
    try{
        const io = getIO();
        io.emit('light_freed_update', lightData);
    }
    catch (error){
        console.log('Error emitting light freed update:', error);
    }
} 