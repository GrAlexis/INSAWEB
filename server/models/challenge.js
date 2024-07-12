const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    icon: { type: String, required: true },
    title: { type: String, required: true },
    reward: { type: String, required: true },
    limitDate: { type: Date, required: true },
    event: { type: String, required: true },
});

module.exports = mongoose.model('Challenge', challengeSchema);
