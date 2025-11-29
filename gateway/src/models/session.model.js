const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  hashedRefreshToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days 
  }
}, { _id: false }); 

const SessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  tokenVersion: { type: Number, required: true },
  lastConnection: { type: Date, required: true },
  refreshTokens: [RefreshTokenSchema]
});

module.exports = mongoose.model('Session', SessionSchema);
