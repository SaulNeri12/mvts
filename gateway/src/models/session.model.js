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
  lastConnection: { type: Date, default: Date.now },
  refreshTokens: [RefreshTokenSchema]
}, {
  // keep versionKey (default) but hide __v when converting to JSON/Object
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret.__v;
      // optional: rename _id to id
      // ret.id = ret._id;
      // delete ret._id;
    }
  },
  toObject: {
    virtuals: true,
    transform(doc, ret) {
      delete ret.__v;
    }
  }
});
// ...existing code...
module.exports = mongoose.model('Session', SessionSchema);

module.exports = mongoose.model('Session', SessionSchema);
