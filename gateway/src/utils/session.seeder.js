const mongoose = require('mongoose');
const sessionModel = require('../models/session.model');

const oid = (id) => new mongoose.Types.ObjectId(id);

const seedSessions = async () => {
    try {
        // Verify connection before starting
        if (mongoose.connection.readyState !== 1) return;

        console.log('Executing session sedeer...');

        await Promise.all([
            sessionModel.deleteMany({})
        ]);
        console.log('Colection cleaned.');

        const sessions = [
            {
                //_id: oid("671fd9e2a3b12c7f9c1a1001"),
                userId: "00000247527",
                tokenVersion: 0,
                refreshTokens: []
            },
            {
                //_id: oid("671fd9e2a3b12c7f9c1a1002"),
                userId: "00000240798",
                tokenVersion: 0,
                refreshTokens: []
            },
            {
                //_id: oid("671fd9e2a3b12c7f9c1a1003"),
                userId: "00000240474",
                tokenVersion: 0,
                refreshTokens: []
            },
            {
                //_id: oid("671fd9e2a3b12c7f9c1a1004"),
                userId: "00000250545",
                tokenVersion: 0,
                refreshTokens: []
            }
        ];
        await sessionModel.insertMany(sessions);

        console.log('The sessions has benn populated correctly.');

    } catch (error) {
        console.error('An error ocurred while populating the sessions', error);
    }
};

module.exports = seedSessions;