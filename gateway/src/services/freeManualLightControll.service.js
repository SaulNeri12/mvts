const manualLightsRepository = require('../repositories/manualLights.repository');
const lightsClient = require('../infrestructure/client/lights.client')
const lightsEmitter = require('../emmiters/lights.emitter')
const {NotFoundError } = require('../errors/errors');

exports.releaseManualControl = async (userId, lightCode) => 
{
    try{
        freeLightFromManualControll(userId, lightCode);
        await freeLightInLightsService(lightCode);
        await emmitLightFreed(userId, lightCode);
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

async function freeLightInLightsService(lightCode){
    try{
        await lightsClient.changeLightState(lightCode, "")
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