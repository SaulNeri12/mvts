const sessionModel = require('../models/session.model');
const {RepositoryError} = require('../errors/errors')

/**
 * Find a user by the id given in the parameter.
 * @param {String} userId 
 */
exports.findSessionByUserId = async (userId) => 
{
  try{
    return await sessionModel.findOne({ userId }, {_id: 0, userId: 0, lastConnection: 0, __v: 0});
  }
  catch(error){
    console.log(error.message);
    throw new RepositoryError();
  }
}

/**
 * Adds a new refresh token (hashed) for a certain user.
 * Optionally removes the old one if provided.
 * @param {String} userId 
 * @param {String} lastRefreshToken - previously used hashed token
 * @param {String} newRefreshToken - new hashed token
 */
exports.updateRefreshTokenHash = async (userId, lastRefreshToken, newRefreshToken) => 
{
  try{
    const session = await sessionModel.findOne({ userId });
    if (!session) return null;

    // Deletes the last refresh token
    session.refreshTokens = session.refreshTokens.filter(
      t => t.hashedRefreshToken !== lastRefreshToken
    );

    // Add new refresh token
    session.refreshTokens.push({ hashedRefreshToken: newRefreshToken });
    session.lastConnection = new Date();

    await session.save();
    return session;
  }
  catch(error){
    console.log(error.message);
    throw new RepositoryError();
  }
}

/**
 * Adds a new refresh token in the users active token list
 * @param {String} userId 
 * @param {String} refreshToken 
 * @returns 
 */
exports.addNewRefreshTokenHash = async (userId, refreshToken) => 
{
  try{
    const session = await sessionModel.findOne({'userId': userId });
    if (!session) return null;

    // Add new refresh token
    session.refreshTokens.push({ hashedRefreshToken: refreshToken });
    session.lastConnection = new Date();

    await session.save();
    return session;
  }
  catch(error){
    console.log(error.message);
    throw new RepositoryError();
  }
}

/**
 * Looks if any of the stored refresh tokens matches
 * with the one given in the parameter.
 * @param {String} userId 
 * @param {String} refreshToken - hashed refresh token to verify
 * @returns {Boolean}
 */
exports.validateRefreshTokenMatch = async (userId, refreshToken) => 
{
  try{
    const session = await sessionModel.findOne({ userId });
    if (!session) return false;

    return session.refreshTokens.some(
      t => t.hashedRefreshToken === refreshToken
    );
  }
  catch(error){
    console.log(error.message);
    throw new RepositoryError();
  }
}

/**
 * Updates the last refresh token for the new one generated
 * in the token refresh process.
 * (Basically replaces one token for another)
 * @param {String} userId 
 * @param {String} lastRefreshToken 
 * @param {String} newRefreshToken 
 */
exports.updateAccesTokenHash = async (userId, lastRefreshToken, newRefreshToken) => 
{
  try{
    const session = await sessionModel.findOne({ userId });
    if (!session) return null;

    const tokenObj = session.refreshTokens.find(
      t => t.hashedRefreshToken === lastRefreshToken
    );

    if (!tokenObj) return null;

    tokenObj.hashedRefreshToken = newRefreshToken;
    tokenObj.createdAt = new Date();

    session.lastConnection = new Date();
    await session.save();

    return session;
  }
  catch(error){
    console.log(error.message);
    throw new RepositoryError();
  }
}

/**
 * Counts the number of refresh tokens of the user.
 * @param {String} userId 
 */
exports.getNumbreOfSessions = async (userId) => 
{
  try{
    const session = await sessionModel.findOne({ userId });
    return session ? session.refreshTokens.length : 0;
  }
  catch(error){
    console.log(error.message)
    throw new RepositoryError();
  }
}

/**
 * Deletes a user session based on the stored refresh token.
 * @param {String} userId 
 * @param {String} refreshToken 
 */
exports.singleLogout = async (userId, refreshToken) => 
{
  try{
    const session = await sessionModel.findOne({ userId });
    if (!session) return null;

    session.refreshTokens = session.refreshTokens.filter(
      t => t.hashedRefreshToken !== refreshToken
    );

    await session.save();
    return session;
  }
  catch(error){
    console.log(error.message);
    throw new RepositoryError();
  }
}

/**
 * Increments the token version to make all refresh tokens invalid.
 * @param {String} userId 
 */
exports.incrementTokenVersion = async (userId) => 
{
  try{
    const session = await sessionModel.findOneAndUpdate(
      { userId },
      { $inc: { tokenVersion: 1 }, $set: { refreshTokens: [] } }, // vacía los tokens
      { new: true }
    );
    return session;
  }
  catch(error){
    console.log(error.message);
    throw new RepositoryError();
  }
}

/**
 * Retrieves the token version of a user.
 * @param {String} userId 
 * @returns {Number|null}
 */
exports.getTokenVersion = async (userId) => 
{
  try{
    const session = await sessionModel.findOne({ userId });
    return session ? session.tokenVersion : null;
  }
  catch(error){
    console.log(error.message);
    throw new RepositoryError();
  }
}