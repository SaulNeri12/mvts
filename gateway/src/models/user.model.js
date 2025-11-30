const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    rol: {type: String,
        enum: ['SENTINEL', 'MANAGER'],
        required: true
    }
});

UserSchema.index({ id: 1}, {unique: true});

module.exports = mongoose.model('User', UserSchema);