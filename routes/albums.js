var express = require("express");
var router = express.Router();
var Album = require("../models/albums");
var Comment = require("../models/comment");
var Review = require("../models/review");
var middleware = require("../middleware/index");
// we don't need to require the index.js in the middleware directory because 
// when we require a directory, the index.js file will always be automatically required 

// INDEX - this is where we list/show all albums
router.get("/", function(req, res) {
    Album.find({}, function(err, allAlbums) {
        if (err) {
            console.log(err);
        } else {
            res.render("albums/index", {albums: allAlbums});     
        } 
    });
});

// NEW - This is where we show the form to submit NEW albums
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("albums/new");
});

// CREATE - this is where we input the album into the form, submit it, and CREATE it
router.post("/", middleware.isLoggedIn, function(req, res) {
    // get data from form and add to albums array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newAlbum = {name: name, image: image, description: desc, author: author};
    // Mongoose code: filling out the form and saving form data to our DB
    // There are several lines of Mongoose code that help setup our DB 
    Album.create(newAlbum, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            // redirect to albums page
            res.redirect("/albums");
        }
    });
});

// SHOW - this is where we show more info on a particular album that is clicked on by user
router.get("/:id", function (req, res) {
    //find the album with provided ID
    Album.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundAlbum) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that album
            res.render("albums/show", {album: foundAlbum});
        }
    });
});

// EDIT - this is the route where we edit an existing album on a form
router.get("/:id/edit", middleware.checkAlbum, function(req, res) {
    Album.findById(req.params.id, function(err, foundAlbum) {          
        res.render("albums/edit", {album: foundAlbum});                                    
    });      
});

// UPDATE - this is the route that takes the edits on the edit form and UPDATES them 
router.put("/:id", function(req, res) {
    delete req.body.album.rating;
    Album.findByIdAndUpdate(req.params.id, req.body.album, function(err, updatedAlbum) {
        if (err) {
            res.redirect("/albums");
        } else {
            res.redirect("/albums/" + req.params.id);
        }
    });
});

// DESTROY route that deletes an album by clicking the button
router.delete("/:id", middleware.checkAlbum, function (req, res) {
    Album.findById(req.params.id, function (err, album) {
        if (err) {
            res.redirect("/albums");
        } else {
            // deletes all comments associated with the album
            Comment.remove({"_id": {$in: album.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/albums");
                }
                // deletes all reviews associated with the album
                Review.remove({"_id": {$in: album.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/albums");
                    }
                    //  delete the album
                    album.remove();
                    req.flash("success", "Album deleted successfully!");
                    res.redirect("/albums");
                });
            });
        }
    });
});

module.exports = router;

