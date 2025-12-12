const authService = require('../services/auth.service');
const logoutService = require('../services/logout.service')
const refreshTokenService = require('../services/refreshToken.service');
const verifySessionStatusService = require('../services/verifySessionStatus.service');

/**
 * Controller function to handle token refresh requests.
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 * @param {Object} next Middlware object.
 */
exports.handleTokenRefresh = async (req, res, next) => 
{
    try {
        const { refresh_token } = req.body;;
        const newTokens =  await refreshTokenService.refreshAccessToken(refresh_token);
        res.status(200).json({ tokens: newTokens });
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
    try {
        const { user_id, refresh_token } = req.body;
        console.log(user_id, refresh_token);
        await logoutService.singleLogout(user_id, refresh_token);
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

/**
 * Controller function to handle session status verification requests.
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 * @param {Object} next Middlware object. 
 */
exports.handleVerifySessionStatus = async(req, res, next) =>
{
  try {
    const {refresh_token } = req.body;
    await verifySessionStatusService.verifySessionStatus(refresh_token);
    res.status(200).json();
  } 
  catch (error) {
    next(error);
  }
} 



