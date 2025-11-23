const refreshTokenService = require('../services/refreshToken.service');
const logoutService = require('../services/logout.service');
const authService = require('../services/auth.service');
const userRepository = require('../repositories/user.repository');

// Controller function to handle token refresh requests
exports.handleTokenRefresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const newAccessToken =  await refreshTokenService.refreshAccessToken(refreshToken);
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
}


// Controller function to handle logout requests
exports.handleLogout = async (req, res) => {
    const { userId } = req.body;
    try {
        await logoutService.handleLogout(userId);
        res.status(200).json();
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
}

// Controller function to get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    res.status(200).json(users);
    } catch (error) {
    res.status(500).json(error.message);
  }
}

// Controller function to handle authentication requests
exports.handleAuthentication = async(req, res) => {
  try {
    const { userId, password } = req.body;
    const result = await authService.authenticateUser(userId, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json(error.message);
  }
}


