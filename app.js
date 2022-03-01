if (process.env.NODE_ENV !== 'production') {    // if not in production mode then require the dotenv
    require('dotenv').config()
}

const express = require('express');
const app = express();

const path = require('path');

const mongoose = require('mongoose');

// importing our User model
const User = require('./model/user.js');

// connecting to our mongoose database
mongoose.connect('mongodb://localhost:27017/basicAuth')
    .then(() => {
        console.log('Connected to Database...');
    })
    .catch((err) => {
        console.log('Cannot connect to database :-(');
        console.log(err);
    });


// Our password hasher 
const bcrypt = require('bcrypt');

// session to store the login info of the user 
const session = require('express-session');

// our middleware to check if a user is logged in or not
const isLoggedIn = require('./middlewares/isLoggedIn.js');


//* SETs and USEs

// for boilerplate
engine = require('ejs-mate');
app.engine('ejs', engine);

// our view template engine
app.set('view engine', 'ejs');

// setting path
app.set('views', path.join(__dirname, 'views'));

// to parse our req object into json
app.use(express.urlencoded({ extended: true }));

// using our session
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // make it true when you are in production mode
        maxAge: 1000 * 60 * 60 * 24
        // 1 milisecond * 1 minute * 1 hour * 1 day = so cookie will expire after one day
    }

}));

app.use(function (req, res, next) {

    // making a global variable to access from any file
    // in this case to hide and show logout, register buttons
    res.locals.loggedIn = req.session._id;
    // now i can access loggedIn variable in my ejs files 

    // since it a middleware so we must do next
    next();
});


//* Routes 

// home page - anyone can access
app.get('/', (req, res) => {
    res.render('home');
});

// login routes
app.get('/login', (req, res) => {
    res.render('login')
});
app.post('/login', async (req, res) => {

    // to login a user, first we will destructure req body
    const { username, password } = req.body;

    // now we will find a user with the username provided in our Database
    const user = await User.findOne({ username: username });

    if (!user) {    // If user does not exist then do not go further to check password
        // return out of loop so that compiler don't go down
        return res.send("<h1>INCORRECT USERNAME!</h1><br><a href='/login'>Login</a>");
    }

    // after we find the the user then we will match if the password is correct or not
    // since we are using the bcrypt so we will user COMPARE function to match the Password
    // syntax - bcrypt.compare(myPlaintextPassword, hashedpassword)
    // this will return a boolean value

    const validateUser = await bcrypt.compare(password, user.password);

    // if the validateUser is true, then login 
    if (validateUser === true) {

        // since the user is validated, now we have to store the user's login info in session
        // so that we can know that the user is logged in and can access authorized pages until his session expires
        req.session._id = user._id  // storing user's id in the session

        // redirecting user to page
        res.redirect('/');
    }
    else {  // if false then no entry
        res.send("<h1>INCORRECT PASSWORD!</h1><br><a href='/login'>Login</a>");
    }
});

// register routes
app.get('/register', (req, res) => {
    res.render('register')
});

app.post('/register', async (req, res) => {
    // Creating a new user and saving its info in Database

    // extracting or destructuring from req body
    const { username, password } = req.body;

    // hashing the password using bcrypt and adding salts to password
    // Syntax is - bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {}

    hashedPassword = await bcrypt.hash(password, 12);

    // now we will store our hashed password and the username in the Database using our model User
    const user = await new User({
        username,
        password: hashedPassword
    });

    // saving the changes we made 
    await user.save();

    // redirecting to home after we registered the user 
    res.redirect('/')

});

// index or main page - only authenticated can access

app.get('/index', isLoggedIn, (req, res) => {
    res.render('index');
});

// logout 
app.post('/logout', (req, res) => {
    // to logout, we have to delete the req.session._id

    // first way
    // req.session._id = null;

    // second way 
    req.session.destroy();

    // do not forget to redirect
    res.redirect('/');
});



// for unknown routes
app.all('*', (req, res) => {
    res.render('error');
});



// listening at port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log('Listening to server...')
});

// Error notes :
// I got an error where i could not install bcrypt and it is really crazy what that probelem was
// guess ?
// The problem was that - there was '&' used in naming my folder which did not let me install bcrypt
// So remember to make folders with legit letters only or you will pull your hairs out of frustration later