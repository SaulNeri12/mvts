const {io} = require('../../server'); // Import the io instance


exports.alertsUpdate = (alertData) => {
    try{
        io.emit('alerts:update', alertData);
    }
    catch (error){
        console.log('Error emitting alerts update:', error);
    }
}