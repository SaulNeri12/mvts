const loadRepository = require('../repositories/loadRepository');

// Get load by vehicleId
exports.getByVehicleId = async (req, res) => {
    try{
        const load = await loadRepository.findByVehicleId(req.params.id);
        if (!load) return res.status(404).send('No encontrado');
        res.json(load);
    }
    catch(error){
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
};

// Get all loads
exports.getAllLoads = async (req, res) => {
    try{
        const loads = await loadRepository.getAll();
        res.json(loads);
    }
    catch(error){
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
};