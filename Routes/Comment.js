const express = require('express');
const Router = express.Router();
const Snap = require('../models/Snap');
const VerifyToken = require('../middlewares/verifyToken');
const Comment = require('../models/Comment');


// Comment on a snap
Router.post('/', VerifyToken, async (req, res) => {
    const { comment, snapId } = req.body;

    try {

        const commentObj = new Comment({
            comment,
            user: req.user.id,
            snap: snapId
        });

        const result = await commentObj.save();

        const snap = await Snap.findById(snapId);
        snap.comments.push(result._id);
        await snap.save();
        const commentData = await result.populate('user').execPopulate();
        return res.send(commentData);
    } catch (error) {
        return res.send({
            error: true,
            errorLog: error
        })
    }
});

// Edit Comment on a snap
Router.post('/edit', VerifyToken, async (req, res) => {
    const { commentId, newComment } = req.body;

    try {

        let comment = await Comment.findById(commentId);

        // Check if the authorized user is requesting to edit the comment
        if (comment.user != req.user.id) {
            return res.send({
                error: true,
                errorLog: 'Not authorized to perform the action.'
            })
        };

        // If a valid user is requesting the action...
        comment.comment = newComment;
        const result = await comment.save();
        return res.send(result);


    } catch (error) {
        return res.send({
            error: true,
            errorLog: error
        })
    }
});

// Delete the comment
Router.delete('/', VerifyToken, async (req, res) => {
    const { commentId, snapId } = req.body;

    try {
        const snap = await Snap.findById(snapId);
        await Comment.findByIdAndDelete(commentId);
        snap.comments.splice(snap.comments.indexOf(commentId), 1);
        await snap.save();
        return res.send('Comment Deleted');

    } catch (error) {
        return res.send({
            error: true,
            errorLog: error
        })
    }
});





module.exports = Router;