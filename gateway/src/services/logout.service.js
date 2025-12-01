const crypto = require('crypto');
const sessionRepository = require('../repositories/session.repository');
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
        const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const session = await sessionRepository.singleLogout(userId, hashedRefreshToken);
        if(!session) throw new NotFoundError('La sesion a cerrar no a sido encontrada');
    }
    catch(error){
        if (error instanceof RepositoryError) {
        throw new InternalError('Error interno del servidor, intente más tarde');
        }
        throw error;
    }
}