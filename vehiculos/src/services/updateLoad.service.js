const vehicleRepository = require('../repositories/vehicle.repository')
const publisher = require('../publisher/publisher')

exports.updateLoad = async(code, status) => {
    try{
        const updatedVehicle = await vehicleRepository.updateLoad(code, status)
    
        const transaction = 'UPDATE_LOAD'
        const response = updatedVehicle
        console.log(transaction, response)
        publisher.publishChange(transaction, response) //send to queue
    }
    catch(error){
        throw new Error(error.message)
    }
}