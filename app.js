// dependencies
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Album = require("./models/albums");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");

// assigning variables to required routes
var commentRoutes = require("./routes/comments");
var reviewRoutes = require("./routes/reviews");
var albumRoutes = require("./routes/albums");
var indexRoutes = require("./routes/index");

var PORT = 3000;

// establishing and setting up mongodb, bodyparser, ejs, flash, static files in public directory
mongoose.connect("mongodb://localhost/album_review_app", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();


// Passport Configuration
app.use(require("express-session")({
    secret: "Be a queen",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use("/", indexRoutes);
app.use("/albums", albumRoutes);
app.use("/albums/:id/comments", commentRoutes);
app.use("/albums/:id/reviews", reviewRoutes);
  
app.listen(PORT, function(req, res) {
    console.log("The server is now listening on PORT " + PORT);
});












