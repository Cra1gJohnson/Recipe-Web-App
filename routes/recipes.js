const express = require('express');
const axios = require('axios');
const Favorite = require('../models/favorite');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user')

const API_KEY = process.env.RECIPE_API_KEY;

// this is displaying the base welcome page index
router.get('/', async (req, res) => {
  res.render('index', { recipes: null });
});

// this displays the result of a search
router.post('/search', async (req, res) => {
  const ingredients = req.body.ingredients;
  const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredients)}`;

  const response = await axios.get(url);
  const recipes = response.data.meals || [];
  res.render('index', {recipes});

});

// this renders a recipes details by getting more info from the api
// using their search by id function
router.get('/search/:id', async(req, res) => {
  const mongoId = req.params.id;
  try {
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mongoId}`);
    const meal = response.data.meals ? response.data.meals[0] : null;

    if (!meal) {
      return res.status(404).send('Recipe not found');
    }
    res.render('recipeDetail', {title: meal.strMeal, meal});
  } catch (err) {
    res.status(500).send('Error fetching recipe details');
  }
});

// this renders the favorites page and passes a sorted list of recipes
router.get('/favorites', async (req, res) => {
  const favorites = await Favorite.find({user: req.session.user.id}).lean();
  res.render('favorites', { favorites, title: 'My Favorite Recipes' });
});

// this adds a favorited recipe to a users list
router.post('/favorites', async (req, res) => {
  try {
    const user = req.session.user.id;
    const {recipeId, title, image} = req.body
    
    console.log({user, recipeId, title, image });
    
  await Favorite.findOneAndUpdate(
    { user: user, recipeId },             // find existing favorite
    { user: user, recipeId, title, image }, // update these fields
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

    res.status(200).json({success: true})
  } catch (e) {
    console.error(e)
    res.status(500).json({ success: false, message: 'DB error' });
  }
});

router.get('/favorites/:id', async (req, res) => {
  const mongoId = req.params.id;
  try {
    // Find the favorite by MongoDB _id
    const favorite = await Favorite.findById(mongoId);
    if (!favorite) {
      return res.status(404).send('Favorite not found');
    }
    // Use the recipeId from the favorite document
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${favorite.recipeId}`);
    const meal = response.data.meals ? response.data.meals[0] : null;
    if (!meal) {
      return res.status(404).send('Recipe not found');
    }
    res.render('favoriteDetail', { title: meal.strMeal, meal });
  } catch (err) {
    res.status(500).send('Error fetching recipe details');
  }
});

router.post('/favorites/:id/remove', async (req, res) => {
  await Favorite.findByIdAndDelete(req.params.id);
  res.redirect('/favorites');
});

router.get('/favoritesRemoval', async (req, res) => {
  await Favorite.deleteMany({});
  res.redirect('/favorites');
});




module.exports = router;
