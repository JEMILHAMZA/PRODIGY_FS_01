// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
require('./config/passport');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

const app = express();

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/eventmanager');

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session Middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/eventmanager' }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));
// Setup flash middleware
app.use(flash());

// Middleware to make flash messages available to all routes
// app.use((req, res, next) => {
//   res.locals.messages = req.flash();
//   next();
// });
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());



app.use((req, res, next) => {
  res.locals.currentRoute = req.path;
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});



app.use('/', authRoutes);
app.use('/events', eventRoutes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
