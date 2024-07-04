if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews')
const users = require('./routes/users')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
//     In Express.js, res.locals is an object that provides a way to pass data through the application during the request-response cycle. It allows you to store variables that can be accessed by your templates and other middleware functions.
})

//This middleware needs to come before we call our routes because we are going to be using the success and error keys inside our route pages

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)
app.use('/', users)

app.get('/', (req, res) => {
    res.render('home')
});

app.get('/fakeUser', async (req, res) => {
    const user = await new User({ username: 'test', email: "test@gmail.com" });
    const newUser = await User.register(user, 'test1234');
    res.send(newUser);
})
// The User.register method is provided by passport-local-mongoose. It takes the newly created user object and a password ('test1234'), hashes the password, and stores the user in the database. The register method returns the newly registered user.

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})