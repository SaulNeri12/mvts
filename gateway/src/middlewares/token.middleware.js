const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // keep the token part

  if (!token) {
    return res.status(401).json('Access token missing');
  }

  // Verify if token is valid
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json('Sesion invalida o expirada.');
    }
    // Save user info in request object
    req.user = user;
    next(); // start next middleware or route handler
  });
}

module.exports = authenticateToken;
