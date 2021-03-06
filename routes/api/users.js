const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const keys = require("../../config/keys");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load user model
const User = require("../../models/User");

// @route GET api/users/test
// @desc Tests users route
// @access Public
router.get("/test", (req, res) => {
  res.json({
    message: "Users works!"
  });
});

// @route POST api/users/register
// @desc Register a user
// @access Public
router.post("/register", async (req, res) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);
    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const user = await User.findOne({
      email: req.body.email
    });
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        // size
        s: "200",
        // rating
        r: "pg",
        // default
        d: "mm"
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, async (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          await newUser.save();
          res.json(newUser);
        });
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// @route POST api/users/login
// @desc Login a user - return a JWT token
// @access Public

router.post("/login", async (req, res) => {
  try {
    const { errors, isValid } = validateLoginInput(req.body);
    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    const user = await User.findOne({
      email
    });
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // User matched
      // Create JWT payload
      const payload = {
        id: user._id,
        name: user.name,
        avatar: user.avatar
      };
      // Sign token
      jwt.sign(
        payload,
        keys.secretOrKey,
        {
          expiresIn: 3600
        },
        (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          });
        }
      );
    } else {
      errors.password = "Password incorrect";
      res.status(400).json(errors);
    }
  } catch (err) {
    console.log(err);
  }
});

// @route GET api/users/current
// @desc Return current user
// @access Private
router.get(
  "/current",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const { id, name, email } = req.user;
    res.json({
      id,
      name,
      email
    });
  }
);

module.exports = router;
