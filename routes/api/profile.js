const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Profile model
const Profile = require('../../models/Profile');
// Load User model
const User = require('../../models/User');

// @route GET api/profile/test
// @desc Tests profile route
// @access Public 
router.get('/test', (req, res) => {
    res.json({
        message: 'Profile works!'
    });
});

// @route GET api/profile
// @desc Get current user profile
// @access Private
router.get('/', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    try {
        const errors = {};
        const profile = await Profile.findOne({
            user: req.user.id
        });
        if (!profile) {
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);
        };
        res.json(profile);
    } catch (err) {
        res.status(404).json(err);
    };
});

module.exports = router;