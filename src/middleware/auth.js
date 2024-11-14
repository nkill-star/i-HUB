module.exports.isLogin = (req, res, next) => {
    console.log("User in session:", req.user);
    if (req.isAuthenticated()) { // checks if session is authenticated by Passport
        
        return next();
    }
    return res.redirect('/user/login'); // redirect to login if not authenticated
};

module.exports.isLogout = (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log("hi")
        return next();

    }
    return res.redirect('/user/userHome'); // redirect to user home if already authenticated
};
