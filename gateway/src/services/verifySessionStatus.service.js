require("dotenv").config();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { JsonWebTokenError } = require('jsonwebtoken');
const sessionRepository = require('../repositories/session.repository');

const {
      RepositoryError,
      UnauthorizedError,
      InternalError
    } = require('../errors/errors');

/**
 * PR
 */
exports.verifySessionStatus = async (refreshToken) => 
{
    try{
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if(!payload) throw new UnauthorizedError('Token erroneo o expirado');
        console.log(payload)
        const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const exist = await sessionRepository.validateRefreshTokenMatch(payload.userId, hashedRefreshToken);
        console.log(exist)
        if(!exist) throw new UnauthorizedError('Token erroneo o expirado');
    }
    catch(error){
        if (error instanceof RepositoryError) {
            throw new InternalError('Error interno del servidor, intente más tarde');
        }
        if (error instanceof JsonWebTokenError) {
            throw new UnauthorizedError('Token erroneo o expirado');
        }
        throw error;
    }
}