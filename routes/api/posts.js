const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Post model
const Post = require('../../models/Post');

// Load Validation
const validatePostInput = require('../../validation/post');

// @route GET api/posts/test
// @desc Tests posts route
// @access Public 
router.get('/test', (req, res) => {
    res.json({
        message: 'Posts works!'
    });
});
// @route GET api/posts
// @desc Get posts
// @access Private
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({
            date: -1
        });
        if (!posts) {
            return res.status(404).json({
                noposterror: 'There are no posts'
            });
        };
        res.json(posts);
    } catch (err) {
        res.status(404).json(err);
    };
});

// @route GET api/posts/:id
// @desc Get post by id
// @access Private
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                noposterror: 'There is no post for such id'
            });
        };
        res.json(post);
    } catch (err) {
        res.status(404).json(err);
    };
});

// @route POST api/posts
// @desc Create a post
// @access Private
router.post('/', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const {
        errors,
        isValid
    } = validatePostInput(req.body);
    // check validation
    if (!isValid) {
        // if there are any errors, return them
        return res.status(400).json(errors);
    };
    const {
        text,
        name,
        avatar
    } = req.body;
    const newPost = new Post({
        text,
        name,
        avatar,
        user: req.user.id
    });
    await newPost.save();
    res.json(newPost);
});

// @route DELETE api/posts/:id
// @desc Delete a post by its id
// @access Private
router.delete('/:id', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    try {
        const post = await Post.findOneAndRemove({
            user: req.user.id,
            _id: req.params.id
        });
        if (!post) {
            return res.status(404).json({
                postnotfound: 'No post with such id found or it doesnt belong to you'
            });
        };
        res.status(200).json({
            message: 'success'
        });
    } catch (err) {
        res.status(404).json({
            postnotfound: 'Invalid id format or problems with server'
        });
    };
});

// @route POST api/posts/like/:id
// @desc Like a post
// @access Private
router.post('/like/:id', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                alreadyliked: 'You already liked this post'
            });
        };
        // Add user like to the array
        post.likes.unshift({
            user: req.user.id
        });
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(404).message(err);
    };
});

// @route POST api/posts/unlike/:id
// @desc Unlike a post
// @access Private
router.post('/unlike/:id', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({
                notliked: 'You have not yet liked this post'
            });
        };
        // Remove the like
        // Get the remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(404).json({
            message: 'Incorrectly formated post id or problems with server'
        });
    };
});

// @route POST api/posts/comment/:id
// @desc Add comment to a post
// @access Private
router.post('/comment/:id', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    try {
        const {
            errors,
            isValid
        } = validatePostInput(req.body);
        // check validation
        if (!isValid) {
            // if there are any errors, return them
            return res.status(400).json(errors);
        };
        const post = await Post.findById(req.params.id);
        const {
            text,
            name,
            avatar
        } = req.body;
        const newComment = {
            text,
            name,
            avatar,
            user: req.user.id
        };
        // add to comments array
        post.comments.unshift(newComment);
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(404).json({
            postnotfound: 'No post found'
        });
    };
});

// @route DELETE api/posts/comment/:id/:comment_id
// @desc Delete a comment from a post
// @access Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // _id visada yra objektas, todel reikia daryti toString()
        if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
            return res.status(404).json({
                nocommentfound: 'No comment found for such post'
            });
        };
        // get the remove index
        const removeIndex = post.comments.map(comment => comment._id.toString()).indexOf(req.params.comment_id);
        //Make sure only the comment owner can delete comment
        if (req.user.id !== post.comments[removeIndex].user.toString()) {
            return res.status(401).json({
                notauthorized: "User not authorized"
            });
        };
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(404).json({
            postnotfound: 'No post found'
        });
    };
});

module.exports = router;