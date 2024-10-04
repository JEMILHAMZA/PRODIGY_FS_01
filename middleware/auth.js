

// middleware/auth.js
  const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  };
  
  const ensureAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    res.redirect('/');
  };
  
  module.exports = {
    ensureAuthenticated,
    ensureAdmin
  };
  