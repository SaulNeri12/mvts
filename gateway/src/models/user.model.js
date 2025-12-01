const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    rol: {type: String,
        enum: ['SENTINEL', 'MANAGER'],
        required: true
    }
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

UserSchema.index({ id: 1}, {unique: true});

module.exports = mongoose.model('User', UserSchema);