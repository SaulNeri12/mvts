const manualLightsRepository = require('../repositories/manualLights.repository');
const lightsEmitter = require('../emmiters/lights.emitter')


exports.takeLightManual = async (userId, light) => 
{
    try{
        manualLightsRepository.validateIfAlreadyTaken(light.code);
        manualLightsRepository.validateMaximumInControll(userId);
        manualLightsRepository.addManualControll(userId, light);
        lightsEmitter.emitLightTaken({userId, light});
    }
    catch(error){
        throw error
    }
}


