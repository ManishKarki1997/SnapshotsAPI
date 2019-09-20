const express = require('express');
const Router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Snap = require('../models/Snap');
const UserValidator = require('../Validators/User');
const jwt = require('jsonwebtoken');
const VerifyToken = require('../middlewares/verifyToken')

// Get User Info
Router.get('/', async (req, res) => {
    const user = await User.find({}).select({
        password: 0
    });
    return res.send(user);
});


// User Sign Up
Router.post('/', async (req, res) => {
    const {
        username,
        name,
        password,
        email,
        profileImageURL
    } = req.body;

    const {
        error
    } = UserValidator(req.body);
    if (error) {
        return res.send({
            error: true,
            errorLog: error.details[0].message
        })
    };

    try {
        const duplicateEmail = await User.findOne({
            email
        });
        if (duplicateEmail) {
            return res.send({
                error: true,
                errorLog: 'User with that email already exists'
            })
        }

        const duplicateUsername = await User.findOne({
            username
        });
        if (duplicateUsername) {
            return res.send({
                error: true,
                errorLog: 'User with that username already exists'
            })
        }
        const hash = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, hash);

        const user = new User({
            username,
            name,
            email,
            profileImageURL,
            password: hashedPassword
        });

        const result = await user.save();
        const token = jwt.sign({
            id: result._id
        }, process.env.JWT_TOKEN_SECRET);
        return res.send({
            result,
            token
        })

    } catch (error) {
        return res.send({
            error: true,
            errorLog: error
        })
    }
});


// User Login
Router.post('/login', async (req, res) => {
    const {
        username,
        password
    } = req.body;

    try {

        const user = await User.findOne({
            username
        }).populate('snaps following followers');
        if (user) {
            // Check for password match
            const passwordMatches = await bcrypt.compare(password, user.password);

            // Password did not match
            if (!passwordMatches) {
                return res.send({
                    error: true,
                    errorLog: 'Invalid Credentials'
                })
            }

            // Password Matched > Sign the user with a JWT token for future requests with the token
            const token = jwt.sign({
                id: user._id
            }, process.env.JWT_TOKEN_SECRET);
            return res.send({
                user,
                token
            })

        } else {
            // Username not found
            return res.send({
                error: true,
                errorLog: 'No user found with that username'
            })
        }

    } catch (error) {
        return res.send({
            error: true,
            errorLog: error
        })
    }
});


// Edit User
Router.put('/', VerifyToken, async (req, res) => {
    const {
        name,
        password,
        profileImageURL
    } = req.body;

    try {

        // req.user.id is set in the "VerifyToken" middleware
        const user = await User.findById(req.user.id);

        // Check if user with the email exists
        if (!user) {
            return res.send({
                error: true,
                errorLog: 'No user found with that email'
            })
        };



        // Check for password lenth greater than 8
        if (password.length < 8) {
            return res.send({
                error: true,
                errorLog: "Password must be at least 8 characters long"
            })
        }


        // Hash the new password
        const hash = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, hash);

        // Update user details 
        user.name = name || user.name;
        user.profileImageURL = profileImageURL || user.profileImageURL;
        user.password = hashedPassword || user.password;

        const result = await user.save();
        return res.send(result);

    } catch (error) {
        return res.send({
            error: true,
            errorLog: error
        })
    }

})


// Search for user/snapshot
Router.get('/search/:searchQuery', async (req, res) => {
    try {
        const userResult = await User.find({
            $text: {
                $search: req.params.searchQuery
            }
        });
        const snapResult = await Snap.find({
            $text: {
                $search: req.params.searchQuery
            }
        }).populate('user comments');
        return res.send({
            users: userResult,
            snapshots: snapResult
        });

    } catch (error) {
        return res.send({
            error: true,
            errorLog: error
        })
    }
});


// Follow User
Router.post('/follow', VerifyToken, async (req, res) => {
    const {
        user,
        followUserId
    } = req.body;

    try {
        const theUser = await User.findById(user);
        const followedUser = await User.findById(followUserId);
        if (theUser.following.indexOf(followUserId) > -1) {
            return res.send({
                error: true,
                errorLog: 'Already following the user!'
            })
        }
        theUser.following.push(followUserId);
        await theUser.save();
        followedUser.followers.push(user);
        await followedUser.save();
        return res.send(followedUser);

    } catch (error) {
        return res.send({
            error: true,
            errorLog: error
        })
    }
})





module.exports = Router;