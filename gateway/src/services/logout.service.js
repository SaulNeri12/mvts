const crypto = require('crypto');
const lightsEmitter = require('../emmiters/lights.emitter')
const sessionRepository = require('../repositories/session.repository');
const manualLightsRepository = require('../repositories/manualLights.repository');
const {ValidationError, 
      RepositoryError,  
      NotFoundError,
      InternalError
    } = require('../errors/errors');

/**
 * Controller function that handles a single device logout.
 * @param {String} userId 
 * @param {String} refreshToken 
 */
exports.singleLogout = async (userId, refreshToken) => 
{
    try{
        const lightsToFreed = getLightToFree(userId)
        freeAllLights(userId);
        await emmitAllLightsFreed(lightsToFreed);
        await closeSession(userId, refreshToken);
    }
    catch(error){
        throw error;
    }
}

function getLightToFree(userId){
    return manualLightsRepository.getLightsByUserId(userId);
}

function freeAllLights(userId) {
    try{
        manualLightsRepository.freeAllLights(userId);
    }catch(error){
        
    }
}

async function emmitAllLightsFreed(userId, lightCodes) {
    try{
        if(!lightCodes || lightCodes.length === 0) return;

        lightCodes.array.forEach(async (lightCode) => {
            await lightsEmitter.emitLightFreed({userId, lightCode});
        });
    }
    catch(error){
        //ignore
    }
}

async function closeSession(userId, refreshToken) {
    try{
        const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const session = await sessionRepository.singleLogout(userId, hashedRefreshToken);
        if(!session) throw new NotFoundError('La sesion a cerrar no a sido encontrada');
    }
    catch(error){
        if (error instanceof RepositoryError || error instanceof NotFoundError) {
            throw new InternalError('Error al internar cerrar la sesion, intente más tarde');
        }
        throw error;
    }
}
