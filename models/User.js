const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    profileImageURL: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    notifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification'
    }],
    snaps: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Snap'
    }],
    joinedDate: {
        type: Date,
        default: Date.now()
    },
})
UserSchema.index({
    name: 'text',
    username: 'text'
});
module.exports = mongoose.model('User', UserSchema);