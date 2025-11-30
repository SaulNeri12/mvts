require('dotenv').config();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sessionRepository = require('../repositories/session.repossitory');
const userRepository = require('../repositories/user.repository');

/**
 * Authenticates a user and generates access and refresh tokens.
 * @param {String} userId 
 * @param {String} password 
 * @returns User object with a payload like name, rol and tokens.
 */
async function authenticateUser(userId, password) {
  try {
    // Validate input fields
    validateInputFields(userId, password);

    // Validate user credentials
    const user = await validateUserCredentials(userId, password);

    // Validates the user amounts of sessions
    await validateNumberOfSessions(userSession)

    // Generate acces and refresh tokens
    const accessToken = generateAccessToken(user, userSession);
    const refreshToken = generateRefreshToken(user, userSession);

    await saveRefreshTokenHash(userId, refreshToken); // save refresh token hash

    // Return user data and tokens
    return {
      user: {
        id: user.id,
        name: user.name,
        rol: user.rol,
      },
      tokens: {
        access: accessToken,
        refresh: refreshToken,
      },
    };
  } catch (error) {
    throw new Error(error.message || 'ID o contraseña invalidos');
  }
}

// Verify required fields
function validateInputFields(userId, password) {
  if (!userId || !password) {
    throw new Error('Ingrese todos los campos antes de continuar');
  }
}

// Find session by id
async function findSessionByUserId(userId){
  try{
      const session = await sessionRepository.findSessionByUserId(userId);
      return session;
  }
  catch(error){
      throw new Error("Error al iniciar sesion, intente de nuevo");
  }
}

// Validate if the number of sessions is under the permited limit
async function validateNumberOfSessions(userId){
  try{
    const userSession = await findSessionByUserId(userId)
    const activeSessions = userSession.refreshTokens.length; //amount of sessions
    if (activeSessions === Number(process.env.MAX_SESSION_NUMBER)) {
      throw new Error('Numero maximo de sesiones activas alcanzado');
    }
  }
  catch(error){
    throw new Error('Numero maximo de sesiones activas alcanzado');
  }
}

// Validate user credentials in the ITSON API
async function validateUserCredentials(userId, password) 
{
  try{
      const user = await userRepository.getUserById(userId);

      // The user doesnt exist nor its been consulted with a rong id
      if(!user) throw new Error();

      // The user password doesnt match with the one recived
      if(user.password !== password) throw new Error();
      
      return user;
  }
  catch(error){
      throw new Error();
  }
}

/**
 * Generate an access token with short expiration (15 minutes) 
 * @param {*} user 
 * @returns 
 */
function generateAccessToken(user, userSession) 
{
    return jwt.sign(
      { userId: user.id, userName: user.name, rol: user.rol, tokenVersion: userSession.tokenVersion },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
}

/**
 * Generate a refresh token with longer expiration (7 days)
 * @param {Object} user 
 * @returns 
 */
function generateRefreshToken(user, userSession) 
{
    return jwt.sign(
      { userId: user.id, userName: user.name, rol: user.rol, tokenVersion: userSession.tokenVersion  },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
}

/**
 * Saves the hashed refresh token in the user repository
 * @param {String} userId
 * @param {String} refreshToken
 */
async function saveRefreshTokenHash(userId, refreshToken) {
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await sessionRepository.addNewRefreshTokenHash(userId, refreshTokenHash);
}

module.exports = { authenticateUser };