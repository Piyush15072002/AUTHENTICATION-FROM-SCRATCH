// In this file we will make a middleware to see if the user is logged in session or not

const isLoggedIn = (req, res, next) => {
    // as the user logged in, his user._id will be stored in the req.session._id made by us
    // so we will see if this exist or not

    if (req.session._id) { // if user exist, move forward by next
        return next();
    }
    else {  // if session does not exist
        res.redirect('/login');
    }

};

module.exports = isLoggedIn;