const isLogin = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next(); // Proceed to the next middleware or route handler
    }
    res.redirect('/user/login'); // Redirect to login if not authenticated
  };

const isLogout = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next(); // proceed if logged out
    }
    return res.redirect('/user/userHome'); // redirect to user home if already authenticated
};
module.exports={
    isLogin,
    isLogout
}
