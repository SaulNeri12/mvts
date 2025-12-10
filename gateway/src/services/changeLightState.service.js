const manualLightsRepository = require('../repositories/manualLights.repository');
const lightsClient = require('../infrestructure/client/lights.client')
const { UnauthorizedError } = require('../errors/errors');

exports.changeLightState = async (userId, lightCode, state) => 
{
    try{
        if(!manualLightsRepository.validateIfTakenByUser(userId, lightCode)){
            throw new UnauthorizedError('No tienes el permiso para modificar el estado del semaforo');
        }
        lightsClient.changeLightState(lightCode, state)
    }
    catch(error){
        throw error
    }
}