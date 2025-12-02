// /src/middlewares/socketAuth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { JsonWebTokenError } = require('jsonwebtoken');
const {UnauthorizedError } = require('../errors/errors');

function AuthenticateSocket(socket, next) {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error("No autorizado"));
    }

    // Aquí validas tu token JWT o lo que uses
    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Firmar el socket con datos del usuario:
        socket.user = payload;

        next();
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            return next(new UnauthorizedError("Token inválido o expirado"));
        }
        throw error;
    }
};

module.exports = AuthenticateSocket;
