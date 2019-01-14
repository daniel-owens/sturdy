//========= ALL MIDDLEWARE ==========

// requiring campground, comment, and review models
var Album = require("../models/albums");
var Comment = require("../models/comment");
var Review = require("../models/review");

var middlewareObj = {}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must log in first.");
    res.redirect("/login");
}

// checking if the user's ID matches the ID of user who created campground
middlewareObj.checkAlbum = function(req, res, next) {
    if (req.isAuthenticated()) {
        Album.findById(req.params.id, function(err, foundAlbum) {
            if (err || !foundAlbum) {
                req.flash("error", "Album not found.")
                res.redirect("back");
            } else {
                // does user have same id as the author of album?
                if (foundAlbum.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "Access denied. This album was shared by somebody else.")
                    res.redirect("back");
                }               
            }
        });
    } else {
        // res.redirect("back") will take the user to the previous page they were on
        req.flash("error", "You need to log in first.")
        res.redirect("back");
    }   
}

// checking if the user's ID matches the ID of user who created any given comment on album
middlewareObj.checkComment = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Comment not found.");
                res.redirect("back");
            } else {
                // does user have same id as the author of comment?
                // refer to the comment model to understand how we are using author and id here
                // req.user._id is stored for us, thanks to passport
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "Permission denied. You are trying to edit somebody else's comment.");
                    res.redirect("back");
                }               
            }
        });
    } else {
        // res.redirect("back") will take the user to the previous page they were on
        req.flash("error", "You need to log in first.");
        res.redirect("back");
    }   
};

middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Album.findById(req.params.id).populate("reviews").exec(function (err, foundAlbum) {
            if (err || !foundAlbum) {
                req.flash("error", "Album not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundAlbum.reviews
                var foundUserReview = foundAlbum.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/albums/" + foundAlbum._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};


 
module.exports = middlewareObj;


