var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//======= AUTH ROUTES =======

// root route
router.get("/", function(req, res) {
    res.render("landing");
})

// shows register form
router.get("/register", function(req, res) {
    res.render("register");
});

// handles register logic
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username})
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            console.log(err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            req.flash("success", user.username + " has successfully created an account!");
            res.redirect("/albums");
        });
    });
});

// shows login form
router.get("/login", function(req, res) {
    // here we render the login page (login ejs file) while also passing the message value and flash method
    res.render("login");
});

// handles login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/albums",
        failureRedirect: "/login"
    }), function(req, res) {
});

// logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "You have been logged out.")
    res.redirect("/");
});

module.exports = router;

