const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // hashed password
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
