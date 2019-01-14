var express = require("express");
var router = express.Router({mergeParams: true});
var Album = require("../models/albums");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// NEW comment form
router.get("/new", middleware.isLoggedIn, function(req, res) {
    Album.findById(req.params.id, function(err, album) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {album: album});
        }
    });
});

// CREATE new comment by pushing comment to comments array
router.post("/", middleware.isLoggedIn, function(req, res) {
    Album.findById(req.params.id, function(err, album) {
        if (err) {
            console.log(err);
            res.redirect("/albums");
        } else {
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong.");
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    console.log("New comment's username will be: " + req.user.username);
                    album.comments.push(comment);
                    album.save();
                    console.log(comment);
                    req.flash("success", "Your comment was successfully submitted.");
                    res.redirect("/albums/" + album._id);
                }
            });
        };
    });
});

// EDIT - edit form for comments
router.get("/:comment_id/edit", middleware.checkComment, function(req, res) {
    Album.findById(req.params.id, function(err, foundAlbum) {
        if (err || !foundAlbum) {
            req.flash("error", "Album not found.");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Comment not found.");
                res.redirect("back");
            } else {
                res.render("comments/edit", {album_id: req.params.id, comment: foundComment});            
            }
        }); 
    });
});

// UPDATE - this is the route where we update comment through a PUT request after the form has been edited 
router.put("/:comment_id", middleware.checkComment, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/albums/" + req.params.id);
        }
    });
});

// DESTROY route that deletes a comment by clicking the button
router.delete("/:comment_id", middleware.checkComment, function(req, res) {
    // the comment_id is referring to the "/:comment_id" in our route
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            res.redirect("/albums");
        } else {
            req.flash("success", "Comment deleted.")
            res.redirect("/albums/" + req.params.id);
        }
    });
});

module.exports = router;
