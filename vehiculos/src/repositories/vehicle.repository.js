// vehiculos/src/repositories/vehicle.repository.js
const vehicleModel = require('../models/vehicle.model');

/**
 * Find a vehicle by its `code` field.
 * @param {String} code Vehicle identifier (code)
 * @returns {Promise<Object|null>} The found vehicle document or null  
 */
exports.findByVehicleByCode = async (code) => {
    try{
        const load = await vehicleModel.findOne({ code: code });
        return load;
    }
    catch(error){
        console.log(error)
        throw new Error('Error obteniendo la carga del vehiculo por su codigo');
    }
};

/**
 * Get all vehicle documents.
 * @returns {Promise<Array>} Array of vehicle documents
 */
exports.getAll = async () => {
    try{
        const loads = await vehicleModel.find();
        if(!loads) return null;
        return loads;
    }
    catch(error){
        console.log(error)
        throw new Error('Error al obtener las cargas');
    }
};

/**
 * Create a new vehicle document.
 * @param {Object} payload Document payload
 * @returns {Promise<Object>} The saved vehicle document
 */
exports.create = async (payload) => {
    try{
        const doc = new vehicleModel(payload);
        const saved = await doc.save();
        return saved;
    }
    catch(error){
        console.log(error)
        throw new Error('Error al crear el vehiculo');
    }
};

/**
 * Updates the isActive attribute of the vehicle
 * @param {String} code Vehicle identificator 
 * @param {Boolean} isActive Boolean of the status
 * @returns Updated vehicle
 */
exports.updateActiveness = async (code, status) => {
    try{
        const vehicle = await vehicleModel.findOne({ code: code });
        if(!vehicle) throw new Error('El vehiculo a actualizar no se encontro');
        
        vehicle.isActive = status;

        await vehicle.save();
        return vehicle;
    }
    catch(error){
        console.log(error)
        throw new Error('Error actualizar el estado del vehiculo');
    }
};

/**
 * Update the load of a vehicle
 * @param {String} code Vehicle identificator 
 * @param {Object} load New vehicle load
 * @returns Updated vehicle
 */
exports.updateLoad = async (code, load) => {
    try{
        const vehicle = await vehicleModel.findOne({ code: code });
        if(!vehicle) throw new Error('El vehiculo a actualizar no se encontro');
        
        vehicle.load = load;

        await vehicle.save();
        return vehicle;
    }
    catch(error){
        console.log(error);
        throw new Error('Error al actualizar la carga del vehiculo');
    }
};

/**
 * Delete a vehicle by its `code` field.
 * @param {String} code Vehicle identifier (code)
 * @returns {Promise<Object|null>} The removed document or null
 */
exports.deleteByCode = async (code) => {
    try{
        const removed = await vehicleModel.findOneAndDelete({ code: code });
        if(!removed) return null;
        return removed;
    }
    catch(error){
        console.log(error);
        throw new Error('Error al eliminar el vehiculo por codigo');
    }
};