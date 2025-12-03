const mongoose = require('mongoose');
const VehicleModel = require('../models/vehicle.model');

const oid = (id) => new mongoose.Types.ObjectId(id);

const seedVehicles = async () => {
    try {
        // Verify connection before starting
        if (mongoose.connection.readyState !== 1) return;

        console.log('Executing vehicles sedeer...');

        await Promise.all([
            VehicleModel.deleteMany({})
        ]);
        
        console.log('Colection cleaned.');

    
        const vehicles = [
            {
                _id: oid("6925f9f684d016d2daf5373c"),
                code: "VH-01",
                isActive: "true",
                load: {
                    material: "Gravel",
                    weight: 1500
                }
            },
            {
                _id: oid("692ab40410491d495b63b112"),
                code: "Iron",
                isActive: "true",
                load: {
                    material: "Gravel",
                    weight: 2000
                }
            }
        ];
        await VehicleModel.insertMany(vehicles);

        console.log('The vehicles has been populated correctly.');

    } catch (error) {
        console.error('An error ocurred while populating the vehicles', error);
    }
};

module.exports = seedVehicles;