const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    challengeId: { type: String, required: true },
    date: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Updated to reference User model
    likes: { type: Number, default: 0 },
    picture: { type: String, required: true },
    description : { type: String, required: true },
    teamId : {type: String, required: false}
});

module.exports = mongoose.model('Post', postSchema);
