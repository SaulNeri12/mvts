require("dotenv").config();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { JsonWebTokenError } = require('jsonwebtoken');
const sessionRepository = require('../repositories/session.repository');

const {
      ValidationError,
      RepositoryError,
      UnauthorizedError,
      TooManySessionsError,
      NotFoundError,
      InternalError
    } = require('../errors/errors');


/**
 * Verify the refresh token and generates a new one pair of tokens (access and refresh).
 * @param {string} refreshToken - The refresh token given by the client.
 * @returns {Object} - A new object with the new refresh and acces token
 * @throws {Error} - If the refresh token is not valid, has expired or doesnt match with 
 * the stored refresh token hash
 */
async function refreshAccessToken(refreshToken) {
  try {
    validateToken(refreshToken)

    const decodedSession = decodeSession(refreshToken);
    validateSession(decodedSession) // validate decoded session

    const storedSession = await findSessionByUserId(decodedSession.userId);
    
    // Verify that the token version matches
    verifyTokenVersionMatch(decodedSession, storedSession);
    // Verify that the refresh token hash matches
    verifyHashMatch(refreshToken, storedSession);

    // Generates a new access token
    const newAccessToken = generateAccessToken(storedSession);

    // Generates a new refresh token
    const newRefreshToken = generateRefreshToken(storedSession);

    // Saves the new refresh token hash in the database
    await saveNewRefreshTokenHash(decodedSession, refreshToken, newRefreshToken)

    // Returns both tokens
    return {
      access: newAccessToken,
      refresh: newRefreshToken
    };
  } catch (error) {
    throw error;
  }
}

function validateToken(refreshToken)
{
  if (!refreshToken) {
    throw new ValidationError("Missing refresh token");
  }
}

/**
 * Decode the user in the refresh token payload.
 * @param {String} refreshToken user refresh token to decode.
 * @returns Decoded user object.
 */
function decodeSession(refreshToken)
{
  try{
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    return decoded;
  }
  catch(error){
    if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedError('Token erroneo o expirado');
    }
    throw error;
  }
}

/**
 * Validate if the decoded session is not null.
 * @param {*} decodedSession 
 */
function validateSession(decodedSession)
{
    if(!decodedSession){
      if(!decoded) throw new UnauthorizedError('Token erroneo o expirado');
    } 
}

/**
 * Helper function to find the user session by his ID.
 * @param {String} userId Users id.
 * @returns Users session object.
 */
function findSessionByUserId(userId){
    try{
      return sessionRepository.findSessionByUserId(userId);
    }
    catch(error){
      if (error instanceof RepositoryError) {
        throw new InternalError('Error interno del servidor, intente más tarde');
      }
      throw error;
    }
}

/**
 * Verify that the token version matches.
 * @param {Object} decodeUser 
 * @param {Object} storedUser 
 */
function verifyTokenVersionMatch(decodeUser, storedUser){
   if (decodeUser.tokenVersion !== storedUser.tokenVersion) {
    throw new UnauthorizedError(
      "Las versiones de los tokens no coinciden"
    );
  }
}

/**
 * Verify that the refresh token hash matches a stored refresh token.
 * @param {String} refreshToken 
 * @param {Object} user 
 */
function verifyHashMatch(refreshToken, user){
    const incomingHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    if(!sessionRepository.validateRefreshTokenMatch(user.id, incomingHash)){
      throw new UnauthorizedError('El token enviado no es valido');
    }
}

/**
 * Generate an access token with short expiration (15 minutes)
 * @param {Object} user User object
 * @returns New access token.
 */
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, rol: user.rol, tokenVersion: user.tokenVersion },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '10m' }
  );
}

/**
 * Generate a refresh token with longer expiration (7 days).
 * @param {Object} user User object.
 * @returns New refresh token.
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Save the new refresh token hash in the database
 * @param {Object} user user payload
 * @param {String} refreshToken previus refresh token
 * @param {*} newRefreshToken new refresh token
 */
async function saveNewRefreshTokenHash(user, refreshToken, newRefreshToken){
  // Hashing the las refresh token for search in data base
  try{
    const lastRefreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    await sessionRepository.updateRefreshTokenHash(user.userId, lastRefreshTokenHash, newRefreshTokenHash);
  }
  catch(error){
    if (error instanceof RepositoryError) {
      throw new InternalError('Error interno del servidor, intente más tarde');
    }
    throw error;
  }
}

module.exports = { refreshAccessToken };
