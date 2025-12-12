const manualLightsRepository = require('../repositories/manualLights.repository');
const lightsEmitter = require('../emmiters/lights.emitter')


exports.takeLightManual = async (userId, lightCode) => 
{
    try{
        manualLightsRepository.validateIfAlreadyTaken(lightCode);
        manualLightsRepository.validateMaximumInControll(userId, lightCode);
        manualLightsRepository.addManualControll(userId, lightCode);
        lightsEmitter.emitLightTaken({userId, lightCode});
    }
    catch(error){
        throw error
    }
}


