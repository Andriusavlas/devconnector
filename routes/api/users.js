const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// Load user model
const User = require('../../models/User');

// @route GET api/users/test
// @desc Tests users route
// @access Public 
router.get('/test', (req, res) => {
    res.json({
        message: 'Users works!'
    });
});

// @route GET api/users/register
// @desc Register a user
// @access Public 
router.post('/register', async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        });
        if (user) {
            return res.status(400).json({
                email: 'Email already exists'
            });
        } else {
            const avatar = gravatar.url(req.body.email, {
                // size
                s: '200',
                // rating
                r: 'pg',
                // default
                d: 'mm'
            });
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                });
            });
            await newUser.save();
            res.json(newUser);
        };
    } catch (err) {
        console.log(err);
    };
});

module.exports = router;