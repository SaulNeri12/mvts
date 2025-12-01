require('dotenv').config();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sessionRepository = require('../repositories/session.repository');
const userRepository = require('../repositories/user.repository');

const {ValidationError, 
      RepositoryError, 
      UnauthorizedError, 
      TooManySessionsError,
      NotFoundError,
      InternalError
    } = require('../errors/errors');

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

    const userSession = await findSessionByUserId(userId)

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
    throw error;
  }
}

// Verify required fields
function validateInputFields(userId, password) {
  if (!userId || !password) {
    throw new ValidationError('Campos para inicio de sesion incompletos');
  }
}

// Find session by id
async function findSessionByUserId(userId){
  try{
      const session = await sessionRepository.findSessionByUserId(userId);
      // TODO: validate the session existence
      return session;
  }
  catch(error){
    if (error instanceof RepositoryError) {
      throw new InternalError('Error interno del servidor, intente más tarde');
    }
    throw error;
  }
}

// Validate if the number of sessions is under the permited limit
async function validateNumberOfSessions(userSession){
  try{
    const activeSessions = userSession.refreshTokens.length; //amount of sessions
    if (activeSessions === Number(process.env.MAX_SESSION_NUMBER)) {
      throw new TooManySessionsError('Numero maximo de sesiones activas alcanzado');
    }
  }
  catch(error){
    if (error instanceof RepositoryError) {
      throw new InternalError('Error interno del servidor, intente más tarde');
    }
    throw error;
  }
}

// Validate user credentials in the ITSON API
async function validateUserCredentials(userId, password) 
{
  try{
      const user = await userRepository.getUserById(userId);

      // The user doesnt exist nor its been consulted with a rong id
      if(!user) throw new NotFoundError('No se ha encontrado ningun usuario con el ID proporcionado');

      // The user password doesnt match with the one recived
      if(user.password !== password) throw new UnauthorizedError('ID o contraseña incorrectos');
      
      return user;
  }
  catch(error){
    if (error instanceof RepositoryError) {
      throw new InternalError('Error interno del servidor, intente más tarde');
    }
    throw error;
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
  try{
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await sessionRepository.addNewRefreshTokenHash(userId, refreshTokenHash);
  }
  catch(error){
    if (error instanceof RepositoryError) {
      throw new InternalError('Error interno del servidor, intente más tarde');
    }
    throw error;
  }
}

module.exports = { authenticateUser };