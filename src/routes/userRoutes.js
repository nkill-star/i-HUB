const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const passport = require("passport");

// Define routes
router.get('/', userController.loadHome);

// Authentication routes
router.get('/user/login', auth.isLogout, userController.loadLogin);
router.get('/user/signup', auth.isLogout, userController.loadSignup);
router.get('/user/userHome', auth.isLogin, userController.loadUserHome);
router.get('/user/logout', userController.logout);
router.post('/user/userHome',userController.loadUserHome)
// Google OAuth routes
router.get('/auth/google', passport.authenticate("google", { scope: ["profile", "email"] }));
router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/user/userHome', // Redirect on successful authentication
    failureRedirect: '/user/login' // Redirect on failure
}));

// POST routes for signup and OTP verification
router.post('/user/signup', userController.registerUser);
router.post('/otpEmail', userController.registerUser);
router.post('/verifyEmail', userController.verifyOtp);

// Route for resending OTP
router.post('/resendOtp', userController.resendOtp);

module.exports = router;
