require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sessionRepository = require('../repositories/session.repository');


/**
 * Verifica el refresh token y genera un nuevo par de tokens (access + refresh).
 * @param {string} refreshToken - El refresh token proporcionado por el cliente.
 * @returns {Object} - Un objeto que contiene el nuevo access token y refresh token.
 * @throws {Error} - Si el refresh token es inválido, ha expirado, o no coincide con el hash almacenado.
 */
async function refreshAccessToken(refreshToken) {
  try {
    if (!refreshToken) {
      throw new Error("Missing refresh token");
    }
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
    await saveNewRefreshTokenHash(storedSession, refreshToken, newRefreshToken)

    // Returns both tokens
    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  } catch (error) {
    console.error("Refresh token error:", error);
    throw new Error(error.message);
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
    console.log('Error decoding session: ', error.message);
    throw new Error('Token erroneo o expirado - acceso revocado');
  }
}

/**
 * Validate if the decoded session is not null.
 * @param {*} decodedSession 
 */
function validateSession(decodedSession){
    if(!decodedSession){
      console.log('The decoded session is missing');
      throw new Error('Token erroneo o expirado - acceso revocado');
    } 
}

/**
 * Helper function to find the user session by his ID.
 * @param {String} userId Users id.
 * @returns Users session object.
 */
function findSessionByUserId(userId){
    try{
      return sessionRepository.findBySessionId(userId);
    }
    catch(error){
        throw new Error("No se pudo refrescar el token de acceso");
    }
}

/**
 * Verify that the token version matches.
 * @param {Object} decodeUser 
 * @param {Object} storedUser 
 */
function verifyTokenVersionMatch(decodeUser, storedUser){
   if (decodeUser.tokenVersion !== storedUser.tokenVersion) {
    throw new Error(
      "Las versiones de los tokens no coinciden - acceso revocado"
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
      throw new Error('El token enviado no es valido - acceso revocado');
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

function hashLastRefreshToken(lastRefreshToken){
  return crypto.createHash("sha256").update(lastRefreshToken).digest("hex");
}

/**
 * Save the new refresh token hash in the database
 * @param {Object} user user payload
 * @param {String} refreshToken previus refresh token
 * @param {*} newRefreshToken new refresh token
 */
async function saveNewRefreshTokenHash(user, refreshToken, newRefreshToken){
  // Hashing the las refresh token for search in data base
    const lastRefreshToken = hashLastRefreshToken(refreshToken);
    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    await sessionRepository.updateRefreshTokenHash(user.id, lastRefreshToken, newRefreshTokenHash);
}

module.exports = { refreshAccessToken };
