const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {           // To store the user's unique ID from Google
        type: String,
        unique: true,
        sparse: true      // Allow users without a Google ID (if not all users use Google login)
    },
    fullName: {           // To store the user's full name from Google
        type: String,
    },
    email: {              // User's email (either from Google or manual signup)
        type: String,
        required: true,
        unique: true
    },
    password: {           // For users who sign up manually (optional for Google users)
        type: String,
    },
});

module.exports = mongoose.model('User', userSchema);
