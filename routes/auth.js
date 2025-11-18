const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.get('/register', async (req, res) => {
  res.render('register', {error: null});
});

router.post('/register', async (req, res, next ) => {
  try {
    const {userName, password} = req.body;
    //validation
    if(!userName|| !password ){
      //return res.status(400).json({error: 'username and password required'});
      return res.status(400).render('register', {
        error: "Username of Password missing ",
      });
    }

    const existing = await User.findOne({userName});
    if(existing) {
      //return res.status(400).json({error: 'username already in use'});
      return res.status(400).render('register', {
        error: "Username already in use ",
      });
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({userName, passwordHash});
    // log in immediatly by making a session 
    req.session.user = {id : user._id.toString(), userName: user.userName};
    req.session.save(err => {
      if (err) {
        console.log("session save error", err);
        return next(err);
      }
      return res.redirect("/");
    });
    

  } catch(err) {
    console.error(err);
    res.status(500).json({error: 'server error'});
  }
});

router.get('/logIn', async (req, res) => {
  res.render('logIn', {error: null});
});

router.post('/logIn', async (req, res, next ) => {
  try {
    const {userName, password} = req.body;
    //validation
    if(!userName|| !password ){
      //return res.status(400).json({error: 'username and password required'});
        return res.status(400).render('logIn', {
        error: "Username of Password missing ",
      });
    }

    const user = await User.findOne({userName});
    if(!user) {
      // return res.status(401).json({error: 'invalid username'});
      return res.status(400).render('logIn', {
        error: "invalid username",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if(!isMatch){
      //return res.status(401).json({error: 'invalid password'});
      return res.status(400).render('logIn', {
        error: "invalid password",
      });
    }

    // log in by making a session 
    req.session.user = {id : user._id.toString(), userName: user.userName};
    // save the session and then redirect to the main page
    req.session.save(err => {
      if (err) {
        console.log("session save error", err);
        return next(err);
      }
      return res.redirect("/");
    });

  } catch(err) {
    console.error(err);
    res.status(500).json({error: 'server error'});
  }
});

router.get("/logOut", (req, res) => {
  req.session.destroy(err => {
    if(err) {
      console.error("logout error", err);
      return res.status(500).send("could not log out");
    }
    // clear browser cookie
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      sameSite: "lax"
    });

    return res.redirect("/");
  })
})


module.exports = router;
