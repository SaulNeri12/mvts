const manualLightsRepository = require('../repositories/manualLights.repository');
const lightsClient = require('../infrestructure/client/lights.client')
const { UnauthorizedError } = require('../errors/errors');

exports.changeLightState = async (userId, lightCode, newSatus) => 
{
    try{
        if(!manualLightsRepository.validateIfTakenByUser(userId, lightCode)){
            throw new UnauthorizedError('No tienes el permiso para modificar el estado del semaforo');
        }  
        manualLightsRepository.updateLightState(userId, lightCode, newSatus);
        await lightsClient.changeLightState(lightCode, newSatus)
    }
    catch(error){
        throw error
    }
}