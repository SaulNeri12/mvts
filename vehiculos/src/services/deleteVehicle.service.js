const vehicleRepository = require('../repositories/vehicle.repository')
const publisher = require('../publisher/publisher')

exports.deleteVehicleByCode = async(code) => {
    try{
        const deletedVehicle = await vehicleRepository.deleteByCode(code)
    
        const transaction = 'DELETE_VEHICLE'
        const response = deletedVehicle.code
        publisher.publishChange(transaction, response)//send to queue
    }
    catch(error){
        throw new Error(error.message)
    }
}