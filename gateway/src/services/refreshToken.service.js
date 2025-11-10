require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userRepository = require("../repositories/user.repository");


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
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    validateUser(decoded) // validate decoded user

    const user = findUser(decoded.userId);
    validateUser(user); // validate found user
    
    // Verify that the token version matches
    verifyTokenMatch(decoded, user);

    // Verify that the refresh token hash matches
    verifyHashMatch(refreshToken, user);

    // Generates a new access token
    const newAccessToken = generateAccessToken(user);

    // Generates a new refresh token
    const newRefreshToken = generateRefreshToken(user);

    // Saves the new refresh token hash in the database
    saveNewRefreshTokenHash(user, newRefreshToken)

    // Returns both tokens
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    console.error("Refresh token error:", error);
    throw new Error(`Could not refresh access token`);
  }
}

// Validate that user exists
function validateUser(user){
    if(!user){
        throw new Error("User not found");
    }
}

// Find user by ID
function findUser(userId){
    try{
        return userRepository.findByUserId(userId);
    }
    catch(error){
        throw new Error("User not found");
    }
}

// Verify that the token version matches
function verifyTokenMatch(decodeUser, storedUser){
    // Verificar que la versión de token coincida
    if (decodeUser.tokenVersion !== storedUser.tokenVersion) {
      throw new Error("Token version mismatch — token revoked");
    }
}

// Verify that the refresh token hash matches
function verifyHashMatch(refreshToken, user){
    const incomingHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const storedHash = userRepository.getRefreshTokenHash(user.id);

    if (incomingHash !== storedHash) {
      throw new Error("Refresh token does not match (possibly revoked)");
    }
}

// Generate an access token with short expiration (15 minutes)
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, rol: user.rol, tokenVersion: user.tokenVersion },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
}

// Generate a refresh token with longer expiration (7 days)
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
}

// Save the new refresh token hash in the database
function saveNewRefreshTokenHash(user, newRefreshToken){
    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    userRepository.updateRefreshTokenHash(user.id, newRefreshTokenHash);
}

module.exports = { refreshAccessToken };
