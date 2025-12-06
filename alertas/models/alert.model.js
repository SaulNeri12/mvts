const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['viaje_completado', 'congestion'],
      required: true 
    },
    data: { type: Object, required: false  },
    timestamp: { type: Date }
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

AlertSchema.index({ id: 1}, {unique: true});

module.exports = mongoose.model('Alert', AlertSchema);