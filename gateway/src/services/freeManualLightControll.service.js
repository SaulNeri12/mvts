const manualLightsRepository = require('../repositories/manualLights.repository');
const lightsEmitter = require('../emmiters/lights.emitter')
const {NotFoundError } = require('../errors/errors');

exports.releaseManualControl = async (userId, lightCode) => 
{
    try{
        freeLightFromManualControll(userId, lightCode);
        emmitLightFreed(userId, lightCode);
    }
    catch(error){
        throw error
    }
}

function freeLightFromManualControll(userId, lightCode)
{
    try{
        manualLightsRepository.freeManualControll(userId, lightCode);
    }
    catch(error){
        console.log(error.message);
        throw new NotFoundError('Error al liberar el semaforo');
    }
}

async function emmitLightFreed(userId, lightCode) {
    try{
        await lightsEmitter.emitLightFreed({userId, lightCode});
    }
    catch(error){
        //ignore
    }
}