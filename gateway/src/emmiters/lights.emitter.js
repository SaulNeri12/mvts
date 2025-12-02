const {io} = require('../../server'); // Import the io instance

exports.lightsUpdate = (lightData) => {
    try{
        io.emit('lights:update', lightData);
    }
    catch (error){
        console.log('Error emitting lights update:', error);
    }
}