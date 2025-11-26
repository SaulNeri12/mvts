const vehicleRepository = require('../repositories/vehicle.repository')
const publisher = require('../publisher/publisher')

exports.updateActiveness = async(code, state) => {
    try{
        const updatedVehicle = await vehicleRepository.updateActiveness(code, state) //state is the same as isActive

        const transaction = 'UPDATE_STATE'
        const response = updatedVehicle
        publisher.publishChange(transaction, response)//send to queue
    }
    catch(error){
        throw new Error(error.message)
    }
}