const express = require("express");
const Router = express.Router();
const User = require("../models/User");
const Snap = require("../models/Snap");
const SnapValidator = require("../Validators/Snap");
const VerifyToken = require("../middlewares/verifyToken");


Router.get('/', (req, res) => {
    res.send('Welcome to the Snapshot API')
})

// Discover Snap/User
Router.get('/discover', async (req, res) => {

    const pageNumber = parseInt(req.query.pageNumber) || 2;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const snaps = await Snap
        .find({})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({
            createdAt: -1
        })
        .populate('comments user')

    const users = await User
        .aggregate([{
            $sample: {
                size: 6
            }
        }])
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)

    return res.send({
        snaps,
        users
    });
})

module.exports = Router;