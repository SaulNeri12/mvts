const refreshTokenService = require('../services/refreshToken.service');
const authService = require('../services/auth.service');
const sessionRepository = require('../repositories/session.repository');

/**
 * Controller function to handle token refresh requests.
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 * @param {Object} next Middlware object.
 */
exports.handleTokenRefresh = async (req, res, next) => 
{
    try {
        const { refreshToken } = req.body;
        const newAccessToken =  await refreshTokenService.refreshAccessToken(refreshToken);
        res.status(200).json({ accessToken: newAccessToken });
    } 
    catch (error) {
        next(error);
    }
}


/**
 * Controller function to handle logout requests.
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 * @param {Object} next Middlware object.
 */
exports.handleLogout = async (req, res, next) => 
{
    const { user_id } = req.body;
    try {
        await sessionRepository.singleLogout(user_id);
        res.status(200).json();
    } catch (error) {
        next(error);
    }
}

/**
 * Controller function to handle authentication requests.
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 * @param {Object} next Middlware object.
 */
exports.handleAuthentication = async(req, res, next) => 
{
  try {
    const { user_id, password } = req.body;
    const result = await authService.authenticateUser(user_id, password);
    res.status(200).json(result);
  } 
  catch (error) {
    next(error);
  }
} 


