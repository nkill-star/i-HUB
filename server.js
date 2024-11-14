require("dotenv").config({ path: './src/.env' });
const express = require('express');
const path = require('path');
const app = express();
const nocache = require('nocache');
const session = require('express-session');
const connectDB = require('./src/db/connectDB');
const userRoutes = require('./src/routes/userRoutes');
const User = require('./src/models/userModel'); // Ensure this is correctly imported

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static('public'));
app.use(express.static('images'));

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require('passport-local').Strategy;

// Middlewares
app.use(nocache());
app.use(session({
    secret: process.env.SESSION_SECRET || 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    },
}));




app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:6500/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          user.googleId = profile.id; // Update Google ID if needed
        } else {
          user = new User({
            googleId: profile.id,
            fullName: profile.displayName,
            email: profile.emails[0].value,
          });
        }

        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Local strategy for username and password authentication
passport.use(new LocalStrategy({
  usernameField: 'email', // Adjust this if you are using "email" instead of "username"
  passwordField: 'password'
}, async (email, password, done) => {
  try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'Incorrect email.' });

      const isMatch = await user.comparePassword(password); // Assuming you have a comparePassword method
      if (!isMatch) return done(null, false, { message: 'Incorrect password.' });

      return done(null, user);
  } catch (err) {
      return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err, null));
});

// Routes
app.use('/', userRoutes);

// Connect to database and start server
connectDB().then(() => {
  app.listen(6500, () => console.log("Server running on port 6500"));
}).catch(err => {
  console.error("Database connection failed", err);
});
