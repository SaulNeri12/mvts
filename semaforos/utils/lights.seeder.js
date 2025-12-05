
//Clase semaforos/utils/lights.seeder.js
const mongoose = require('mongoose');
const SemaforoModel = require('../models/SemaforoModel');

const oid = (id) => new mongoose.Types.ObjectId(id);

const seedLights = async () => {
    try {
        // Verify connection before starting
        if (mongoose.connection.readyState !== 1) return;

        console.log('Executing lights sedeer...');

        await Promise.all([
            SemaforoModel.deleteMany({})
        ]);
        
        console.log('Colection cleaned.');

    
        const lights = [
            {
                _id: oid("692a86ce748f9c4efc24546a"),
                code: "247498",
                description: "Este es otro semaforo de prueba",
                position: {
                    latitude: "30.97278024833265",
                    longitude: "-110.3504071944602"
                }
            },
            {
                _id: oid("692a86e3748f9c4efc24546c"),
                code: "123456",
                description: "Este es otro semaforo de prueba arre we",
                position: {
                    latitude: "30.9692866660163",
                    longitude: "-110.355977576714"
                }
            }
        ];
        await SemaforoModel.insertMany(lights);

        console.log('The lights has benn populated correctly.');

    } catch (error) {
        console.error('An error ocurred while populating the lights', error);
    }
};

module.exports = seedLights;