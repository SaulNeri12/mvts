const vehicleRepository = require('../repositories/vehicle.repository')
const publisher = require('../publisher/publisher')

exports.createVehicle = async(vehicle) => {
    try{
        const createdVehicle = await vehicleRepository.create(vehicle)

        const transaction = 'CREATE_VEHICLE'
        const response = createdVehicle
        publisher.publishChange(transaction, response)//send to queue
    }
    catch(error){
        throw new Error(error.message)
    }
}

