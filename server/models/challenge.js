const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    icon: { type: String, required: true },
    title: { type: String, required: true },
    reward: { type: String, required: true },
    limitDate: { type: Date, required: true },
    eventId: { type: String, required: true },
    prestige : { type: String, required: true } 
});

module.exports = mongoose.model('Challenge', challengeSchema);
