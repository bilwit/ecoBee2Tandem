const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccessTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  }
});

module.exports = Item = mongoose.model(
  'accesstoken',
  AccessTokenSchema,
);
