const express = require("express");
const Router = express.Router();
const User = require("../models/User");
const Snap = require("../models/Snap");
const SnapValidator = require("../Validators/Snap");
const VerifyToken = require("../middlewares/verifyToken");

// Create a snap
Router.post("/", VerifyToken, async (req, res) => {
  const {
    title,
    user,
    imageURL
  } = req.body;

  try {
    const creator = await User.findById(user);
    const {
      error
    } = SnapValidator(req.body);
    if (error) {
      return res.send({
        error: true,
        errorLog: error.details[0].message
      });
    }

    const snap = new Snap({
      title,
      user,
      imageURL
    });

    const result = await snap.save();
    creator.snaps.push(result._id);
    await creator.save();
    return res.send(result);
  } catch (error) {
    return res.send({
      error: true,
      errorLog: error
    });
  }
});

// Fetch all snaps
Router.get("/", async (req, res) => {
  const pageNumber = parseInt(req.query.pageNumber) || 2;
  const pageSize = parseInt(req.query.pageSize) || 10;

  try {
    const snaps = await Snap.find({})
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({
        createdAt: -1
      })
      .populate("comments user");

    return res.send(snaps);
  } catch (error) {
    return res.send({
      error: true,
      errorLog: error
    });
  }
});

// Fetch single Snap
Router.get("/:snapId", async (req, res) => {
  try {
    const snaps = await Snap.findById(req.params.snapId)
      .populate("comments user")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          model: User
        }
      });

    return res.send(snaps);
  } catch (error) {
    return res.send({
      error: true,
      errorLog: error
    });
  }
});

// Delete Snap
Router.delete("/:snapId", VerifyToken, async (req, res) => {
  const {
    snapId
  } = req.params;

  try {
    const snap = await Snap.findById(snapId);
    if (snap.user != req.user.id) {
      return res.send({
        error: true,
        errorLog: "Not authorized to perform this action."
      });
    }
    const user = await User.findById(req.user.id);
    await Snap.findByIdAndDelete(snapId);
    await user.snaps.splice(user.snaps.indexOf(snapId), 1);
    return res.send("Snap deleted successfully");
  } catch (error) {
    return res.send({
      error: true,
      errorLog: error
    });
  }
});

// Edit Snap
Router.put("/", VerifyToken, async (req, res) => {
  const {
    snapId,
    title,
    imageURL
  } = req.body;

  try {
    let snap = await Snap.findById(snapId);

    // Fix req.user not existing later

    // if (snap.user != req.user.id) {
    //   return res.send({
    //     error: true,
    //     errorLog: "Not authorized to perform this action."
    //   });
    // }

    snap.title = title || snap.title;
    snap.imageURL = imageURL || snap.imageURL;

    const result = await snap.save();
    return res.send(result);
  } catch (error) {
    return res.send({
      error: true,
      errorLog: error
    });
  }
});

// Like a snap
Router.post("/like", VerifyToken, async (req, res) => {
  const {
    snapId
  } = req.body;

  try {
    const snap = await Snap.findById(snapId);
    const userAlreadyLiked =
      snap.likers.indexOf(req.user.id) >= 0 ? true : false;
    if (userAlreadyLiked) {
      snap.likers.splice(snap.likers.indexOf(req.user.id), 1);
      snap.likes--;
    } else {
      snap.likers.push(req.user.id);
      snap.likes++;
    }

    const result = await snap.save();
    return res.send(result);
  } catch (error) {
    return res.send({
      error: true,
      errorLog: error
    });
  }
});

module.exports = Router;