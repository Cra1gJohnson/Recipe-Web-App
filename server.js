if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}
console.log('→ connecting to', process.env.MONGO_URI);

const express           = require('express');
const expressLayouts    = require('express-ejs-layouts');
const mongoose          = require('mongoose');
const path              = require('path');
const recipesRouter     = require('./routes/recipes');
const session           = require("express-session");
const mongostore        = require("connect-mongo");
const authRouter        = require("./routes/auth");
const user = require('./models/user');

// init app
const app = express();

// connect to mongo - this takes time so put first
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log(' MongoDB connected'))
  .catch(err => console.error(' MongoDB connection error:', err));

// setting view engine and layout setup
// towards the top so express knows how to render
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// layouts and static files
// served before routers or intercepts
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));

// body parsers
// needed for login and session
app.use(express.urlencoded({ extended: false })); // for forms
app.use(express.json());  // for json (recipes,  etc. )

// session middleware setup
// must be before current user middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    store: mongostore.create(
      {
        mongoUrl: process.env.MONGO_URI
      }
    ),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000*60*60,  // 1 hour
    }

  })
);

// custom middleware to load current user
// depends on session 
app.use(async (req, res, next) => {

 
  res.locals.currentUser = req.session.user || null;
  next();

});

// routers
// all info is ready and can begin to route
app.use(recipesRouter);
app.use(authRouter);

// port and listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Listening on port ${PORT}`));
