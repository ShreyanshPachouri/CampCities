const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async(req, res, next) => {
    try{
    const {username, email, password} = req.body
    const user =  new User({username, email})
    const registeredUser = await User.register(user, password)
    req.login(registeredUser, err => {
        if(err) return next(err)
        req.flash('success', "Welcome to YelpCamp")
        res.redirect('/campgrounds')
    })
    // The User.register method is provided by passport-local-mongoose. It takes the newly created user object and a password ('password'), hashes the password, and stores the user in the database. The register method returns the newly registered user.

    // This snippet is using the req.login method provided by Passport.js to establish a login session for a user who has just been authenticated or registered.
 }catch(e){
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
    //res.render gives the URL address and not the file location in the directory
}

module.exports.login = (req, res) => { 
    req.flash('succes', "Welcome back")
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl)
    delete req.session.returnTo
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}