const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    challengeId: { type: String },
    date: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Updated to reference User model
    likes: { type: Number, default: 0 },
    picture: { type: String, required: true },
    thumbnail: { type: String},
    description : { type: String},
    teamId : {type: String, required: false},
    isValidated: { type: Boolean, default: false }
});

module.exports = mongoose.model('Post', postSchema);
