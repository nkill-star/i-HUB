// Import necessary modules
require("dotenv").config({ path: './src/.env' });
const userSchema = require('../models/userModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configuration
const saltround = 10;
const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // OTP valid for 5 minutes

// Temporary in-memory storage for OTPs
const otpStore = new Map(); 

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

// Helper function to send OTP email
const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP for Signup',
        text: `Your OTP is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);
    
};

// Register user with OTP verification
const registerUser = async (req, res) => {
    console.log(req.body)
    try {
        const { email, password } = req.body;

        // Check if the user already exists
        const user = await userSchema.findOne({ email });
        if (user) return res.render('user/login', { message: 'User already exists' });

        const otp = crypto.randomInt(100000, 999999).toString();

        // Store OTP with expiration time
        otpStore.set(email, { password, otp, expiresAt: Date.now() + OTP_EXPIRATION_TIME });
        

        

        // Send OTP to user's email
        await sendOtpEmail(email, otp);

        // Render OTP verification page
        res.render('otpEmail', { email }); 
    } catch (error) {
        console.log(error);
        res.render('user/signup', { message: 'Something went wrong' });
    }
};

// Verify OTP and create user
const verifyOtp = async (req, res) => {
    
    const { otp } = req.body;
    const email=otpStore.keys().next().value
    
    // Retrieve the OTP stored for the user
    const storedOtpData = otpStore.get(email);
    const password=storedOtpData.password
    console.log('strdata',storedOtpData,otp);
    
    

    // Check if the OTP exists and is valid
    if (storedOtpData && storedOtpData.otp === otp && Date.now() < storedOtpData.expiresAt) {
        
        // OTP is correct and not expired

        // Hash the password and create the new user
        const hashedPassword = await bcrypt.hash(password, saltround);
        const newUser = new userSchema({
            email,
            password: hashedPassword,
        });
        

        // Save the new user to the database
        await newUser.save();

        // Remove the OTP from memory after successful verification
        otpStore.delete(email);

        // Redirect to login page with success message
        res.render('user/login', { message: 'User created successfully' });
    } else {
        // OTP is invalid or expired
        res.render('otpEmail', { email, message: 'Invalid or expired OTP' });
    }
};

const resendOtp = async (req, res) => {
    const { email } = req.body;

    // Verify that the email exists in your database
    const user = await userSchema.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000);  // Generate 6-digit OTP
    

    // Store the OTP and expiration time
    otpStore.set(email, { otp, expiresAt: Date.now() + 300000 }); // OTP expires in 5 minutes

    // Send OTP via email
    try {
        await sendOtpEmail(email, otp);
        res.json({ success: true, message: 'OTP has been resent to your email' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error sending OTP' });
    }
};

const logout = (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy((err) => {
            if (err) return next(err);
            res.redirect('/user/login');
        });
    });
};
// Render home, login, and signup pages
const loadHome = (req, res) => {
    res.render('home');
};
const loadViewAllProduct=(req,res)=>{
    res.render('user/viewAllProduct')
}
const loadProductPage=(req,res)=>{
    res.render('user/productPage')
}

const loadLogin = (req, res) => {
    res.render('user/login');
};

const loadSignup = (req, res) => {
    res.render('user/signup');
};
const loadUserHome = (req, res) => {
    // Prevent the page from being cached
    res.setHeader('Cache-Control', 'no-store');
  
    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
      return res.redirect('/user/login'); // If not authenticated, redirect to login
    }
  
    // If the user is authenticated, render the userHome page
    res.render('user/userHome');
  };

// Export functions
module.exports = {
    loadLogin,
    loadHome,
    loadSignup,
    registerUser,
    verifyOtp,
    resendOtp,
    loadUserHome,
    logout,
    loadViewAllProduct,
    loadProductPage
};
