const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  id: String,
  name: String,
  code: String
}, { timestamps: true });

module.exports = mongoose.model('State', stateSchema);
