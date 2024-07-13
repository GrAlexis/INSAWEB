const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    challengeId: { type: String, required: true },
    date: { type: Date, required: true },
    user: { type: String, required: true },
    likes: { type: Number, default: 0 },
    picture: { type: String, required: true },
    description : { type: String, required: true }
});

module.exports = mongoose.model('Post', postSchema);
