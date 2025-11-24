const vehicleRepository = require('../repositories/vehicle.repository');
const createVehicleService = require('../services/createVehicle.service')
const deleteVehicleService = require('../services/deleteVehicle.service')
const updateActivenessService = require('../services/updateActiveness.service')
const updateLoadService = require('../services/updateLoad.service')

/**
 * Get all vehicles/loads
 */
exports.getAllLoads = async (req, res) => {
    try{
        console.log('peticion aceptada')
        const loads = await vehicleRepository.getAll();
        res.status(200).json(loads);
    }
    catch(error){
        res.status(500).send(error.message);
    }
};

exports.findByVehicleByCode = async (req, res) => {
    try{
        const code = req.query.code;
        const loads = await vehicleRepository.findByVehicleByCode(code);
        res.status(200).json(loads);
    }
    catch(error){
        res.status(500).send(error.message);
    }
};

/**
 * Create a new vehicle document
 */
exports.create = async (req, res) => {
    try{
        const vehicle = req.body;
        const created = await createVehicleService.createVehicle(vehicle);
        res.status(201).json(created);
    }
    catch(error){
        res.status(500).send(error.message);
    }
};

/**
 * Update vehicle activeness by `code`.
 * Expects `isActive` in the request body (boolean).
 */
exports.updateState = async (req, res) => {
    try{
        const {code, state} = req.body;
        const updated = await updateActivenessService.updateActiveness(code,state);
        res.json(updated);
    }
    catch(error){
        res.status(500).send(error.message);
    }
};

/**
 * Update vehicle load by `code`.
 * Expects `load` in the request body (array or object matching schema).
 */
exports.updateLoad = async (req, res) => {
    try{
        const {code, load} = req.body;
        console.log(code, load)
        const updated = await updateLoadService.updateLoad(code, load);
        res.json(updated);
    }
    catch(error){
        res.status(500).send(error.message);
    }
};

/**
 * Delete a vehicle by its `code` field.
 */
exports.deleteByCode = async (req, res) => {
    try{
        const code = req.body.code;
        const removed = await deleteVehicleService.deleteVehicleByCode(code);
        if(!removed) return res.status(404).send('No encontrado');
        res.json(removed);
    }
    catch(error){
        res.status(500).send(error.message);
    }
};