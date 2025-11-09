// vehiculos/src/repositories/loadRepository.js
const loadModel = require('../models/load');

// get load by vehicleId
exports.findByVehicleId = async (vehicleId) => {
    try{
        const load = await loadModel.findOne({idVehicle: vehicleId});
        return load;
    }
    catch(error){
        throw new Error('Error fetching load by vehicleId: ' + error.message);
    }
};

//getAll loads
exports.getAll = async () => {
    try{
        const loads = await loadModel.find();
        return loads;
    }
    catch(error){
        throw new Error('Error fetching all loads: ' + error.message);
    }
};