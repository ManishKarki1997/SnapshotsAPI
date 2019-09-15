const mongoose = require('mongoose');

const schema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    imageURL: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0,
    },
    likers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
})

schema.index({
    title: 'text',
});

module.exports = mongoose.model('Snap', schema);