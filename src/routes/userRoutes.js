const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const passport = require("passport");

// Define routes
router.get('/',auth.isLogout, userController.loadHome);

// Authentication routes
router.get('/user/login', auth.isLogout, userController.loadLogin);
router.get('/user/signup', auth.isLogout, userController.loadSignup);
router.get('/login', (req, res) => {
    // If the user is already logged in, redirect to the userHome page
    if (req.isAuthenticated()) {
      return res.redirect('/user/userHome');
    }
    res.render('user/login'); // Render login page if not authenticated
  });
  
  // User home route
  router.get('/user/userHome', auth.isLogin, userController.loadUserHome);
router.get('/user/logout', userController.logout);
// Local Authentication routes
router.post('/login', passport.authenticate('local', {
    successRedirect: '/user/userHome', // Redirect on successful authentication
    failureRedirect: '/user/login', // Redirect on failure
    failureFlash: true // Optional: Use flash messages for errors (if using connect-flash)
}));

// Google OAuth routes
router.get('/auth/google', passport.authenticate("google", { scope: ["profile", "email"] }));
router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/user/userHome', // Redirect on successful authentication
    failureRedirect: '/user/login' // Redirect on failure
}));

// POST routes for signup and OTP verification
router.post('/user/signup', userController.registerUser);
router.post('/otpEmail', userController.registerUser);
router.post('/verifyOtp', userController.verifyOtp);

// Route for resending OTP
router.post('/resendOtp', userController.resendOtp);

module.exports = router;
