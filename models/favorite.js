const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },  
  recipeId: {type: String,  required: true},
  title: {type: String},
  image: {type: String},
  addedAt: { type: Date, default: Date.now },
});

favoriteSchema.index({user: 1, recipeId: 1}, {unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
