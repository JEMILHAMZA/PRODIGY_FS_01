

// routes\auth.js
const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Home Route - Redirect based on authentication and role
router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    // Redirect to events or any other page based on user role
    res.redirect('/events');
   
  } else {
    res.render('login', { currentRoute: '/login', messages: req.flash() }); // Redirect to register/login if not authenticated
  }
});

// Register Route
router.get('/register', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/events');
  } else {
    res.render('register', { currentRoute: '/register', messages: req.flash() });
  }
});






// Register Route (POST)

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash('error', 'Username has already been taken.');
      return res.redirect('/register');
    }

    // Check if password is at least 6 characters
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/register');
    }

    // If all checks pass, register the user
    const user = new User({ username, role });
    await User.register(user, password);
    req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/login');
  } catch (error) {
    req.flash('error', 'An error occurred during registration.');
    res.redirect('/register');
  }
});



// Login Route
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/events');
  } else {
    res.render('login', { currentRoute: '/login', messages: req.flash() });
  }
});



// Custom Login Route (POST)
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Check if the username exists
    const user = await User.findOne({ username });
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/login');
    }

    // If the user exists, verify the password
    user.authenticate(password, (err, user, passwordErr) => {
      if (err) return next(err);

      if (passwordErr) {
        req.flash('error', 'Incorrect password.');
        return res.redirect('/login');
      }

      // If authentication is successful, log the user in
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.redirect('/events');
      });
    });
  } catch (error) {
    console.log(error);
    req.flash('error', 'An error occurred during login.');
    return res.redirect('/login');
  }
});

// Logout Route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});



// Profile View Route
router.get('/profile', ensureAuthenticated, (req, res) => {
  res.render('profile', { user: req.user, messages: req.flash() });
});

// Profile Update Route
router.post('/profile', ensureAuthenticated, async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Check if the username is available
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        req.flash('error', 'Username already taken.');
        return res.redirect('/profile');
      }
      user.username = username;
    }

    // Validate password length
    if (password && password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters long.');
      return res.redirect('/profile');
    }

    // Validate and update password if provided
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/profile');
      }
      user.setPassword(password, async () => {
        await user.save(); // Save the user with new password
        req.login(user, (err) => {
          if (err) {
            console.log(err);
            req.flash('error', 'Failed to authenticate user.');
            return res.redirect('/profile');
          }
          req.flash('success', 'Profile updated successfully.');
          res.redirect('/events');
        });
      });
    } else {
      await user.save(); // Save the user with new username only
      req.login(user, (err) => { // Re-authenticate the user to reflect the changes
        if (err) {
          console.log(err);
          req.flash('error', 'Failed to authenticate user.');
          return res.redirect('/profile');
        }
        req.flash('success', 'Profile updated successfully.');
        res.redirect('/events');
      });
    }
  } catch (error) {
    console.log(error);
    req.flash('error', 'Failed to update profile.');
    res.redirect('/profile');
  }
});



module.exports = router;





// router.post('/register', async (req, res) => {
//   const { username, password, role } = req.body;
//   try {
//     const user = new User({ username, role });
//     await User.register(user, password);
//     res.redirect('/login');
//   } catch (error) {
//     console.log(error);
//     res.redirect('/register');
//   }
// });
