require("dotenv").config();
const crypto = require("crypto");
const sessionRepository = require('../repositories/session.repository');

const {
      RepositoryError,
      UnauthorizedError,
      InternalError
    } = require('../errors/errors');

/**
 * 
 */
exports.verifySessionStatus = async (userId, refreshToken) => 
{
    try{
        const hashedRefreshToken = crypto.makeHash('sha256').update(refreshToken).digest('hex');
        const exist = await sessionRepository.validateRefreshTokenMatch(userId, hashedRefreshToken);
        if(!exist) throw new UnauthorizedError('Token erroneo o expirado');
        return exist;
    }
    catch(error){
        if (error instanceof RepositoryError) {
            throw new InternalError('Error interno del servidor, intente más tarde');
        }
        throw error;
    }
}