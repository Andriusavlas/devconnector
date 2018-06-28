const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// load validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

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
        }).populate('user', ['name', 'avatar']);
        if (!profile) {
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);
        };
        res.json(profile);
    } catch (err) {
        res.status(404).json(err);
    };
});

// @route GET api/profile/test
// @desc Tests profile route
// @access Public 
router.get('/test', (req, res) => {
    res.json({
        message: 'Profile works!'
    });
});

// @route GET api/profile/all
// @desc Get all profiles
// @access Public
router.get('/all', async (req, res) => {
    try {
        const errors = {};
        const profiles = await Profile.find().populate('user', ['name, avatar']);
        if (!profiles || profiles.length === 0) {
            errors.noprofile = 'There are no profiles';
            return res.status(404).json(errors);
        }
        res.json(profiles);
    } catch (err) {
        res.status(404).json({
            error: 'There are no profiles'
        });
    };
});

// @route GET api/profile/handle/:handle
// @desc Get a user profile by handle
// @access Public
router.get('/handle/:handle', async (req, res) => {
    try {
        const errors = {};
        const profile = await Profile.findOne({
            handle: req.params.handle
        }).populate('user', ['name', 'avatar']);
        if (!profile) {
            errors.noprofile = 'There is no profile for this user';
            res.status(404).json(errors);
        } else {
            res.json(profile);
        };
    } catch (err) {
        res.status(404).json(err);
    };
});

// @route GET api/profile/user/:user_id
// @desc Get a user profile by user id
// @access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const errors = {};
        const profile = await Profile.findOne({
            _id: req.params.user_id
        }).populate('user', ['name', 'avatar']);
        if (!profile) {
            errors.noprofile = 'There is no profile for this user';
            res.status(404).json(errors);
        } else {
            res.json(profile);
        };
    } catch (err) {
        res.status(404).json({
            error: 'Invalid profile ID'
        });
    };
});

// @route POST api/profile
// @desc Create or Update user profile
// @access Private
router.post('/', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    try {
        const {
            errors,
            isValid
        } = validateProfileInput(req.body);
        // check validation
        if (!isValid) {
            return res.status(400).json(errors);
        };
        // Get all fields from request
        const profileFields = {};
        // nenustacius .social={} neranda tokio property ir neleidzia jo setinti kazkam
        profileFields.social = {};
        profileFields.user = req.user;
        const whiteList = ['handle', 'company', 'website', 'bio', 'status', 'githubusername', 'skills', 'youtube', 'twitter', 'instagram', 'facebook', 'linkedin'];
        const inputData = Object.keys(req.body);
        for (key of inputData) {
            if (whiteList.includes(key)) {
                if (key === 'skills' && typeof req.body.skills !== 'undefined') {
                    profileFields[key] = req.body.skills.split(',');
                } else if (['youtube', 'twitter', 'instagram', 'facebook', 'linkedin'].includes(key) && req.body[key]) {
                    profileFields.social[key] = req.body[key];
                } else if (req.body[key]) {
                    profileFields[key] = req.body[key];
                };
            };
        };
        const profile = await Profile.findOne({
            user: req.user.id
        });
        if (profile) {
            // Update
            const updatedProfile = await Profile.findOneAndUpdate({
                user: req.user.id
            }, {
                $set: profileFields
            }, {
                new: true
            });
            res.json(updatedProfile);
        } else {
            // Create

            // Check if handle exists
            const profile = await Profile.findOne({
                handle: profileFields.handle
            });
            if (profile) {
                errors.handle = 'That handle already exists';
                res.status(400).json(errors);
            };

            // Save profile
            const newProfile = await new Profile(profileFields).save();
            res.json(newProfile);
        };
    } catch (err) {
        res.status(404).json(err);
    };
});

// @route POST api/profile/experience
// @desc Add experience to profile
// @access Private
router.post('/experience', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    try {
        const {
            errors,
            isValid
        } = validateExperienceInput(req.body);
        // check validation
        if (!isValid) {
            return res.status(400).json(errors);
        };
        const profile = await Profile.findOne({
            user: req.user.id
        });
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;
        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        };
        // Add to experience array
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        res.status(400).json(err);
    };
});

// @route POST api/profile/education
// @desc Add education to profile
// @access Private
router.post('/education', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    try {
        const {
            errors,
            isValid
        } = validateEducationInput(req.body);
        // check validation
        if (!isValid) {
            return res.status(400).json(errors);
        };
        const profile = await Profile.findOne({
            user: req.user.id
        });
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;
        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        };
        // Add to experience array
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch (err) {
        res.status(400).json(err);
    };
});

// @route DELETE api/profile/experience/:exp_id
// @desc Delete an experience by its id
// @access Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });
        // Get remove index
        const removeIndex = profile.experience.map(item => item._id).indexOf(req.params.exp_id);
        if (removeIndex === -1) {
            return res.status(404).json({
                noexperience: 'No experience with such id found'
            });
        };
        // splice out of the array
        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        res.status(404).json(err);
    };
});

// @route DELETE api/profile/education/:edu_id
// @desc Delete an education by its id
// @access Private
router.delete('/education/:edu_id', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });
        // Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        if (removeIndex === -1) {
            return res.status(404).json({
                noeducation: 'No education with such id found'
            });
        };
        // splice out of the array
        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.log(err);
        res.status(404).json({
            message: 'Incorrectly formated id or problems with server'
        });
    };
});

// @route DELETE api/profile
// @desc Delete a profile
// @access Private
router.delete('/', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    try {
        await Profile.findOneAndRemove({
            user: req.user.id
        });
        await User.findOneAndRemove({
            _id: req.user.id
        });
        res.json({
            success: true
        });
    } catch (err) {
        res.status(404).json(err);
    };
});

module.exports = router;