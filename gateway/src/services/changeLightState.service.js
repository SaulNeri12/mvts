const manualLightsRepository = require('../repositories/manualLights.repository');
const lightsClient = require('../infrestructure/client/lights.client')

exports.getAllLights = async (userId, lightId, state) => 
{
    try{
        if(!manualLightsRepository.validateIfTakenByUser(userId)){
            return
        }
        lightsClient.changeLightState(lightId, state)
    }
    catch(error){
        throw error
    }
}