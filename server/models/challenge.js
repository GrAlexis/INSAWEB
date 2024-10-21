const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    icon: { type: String, required: false },
    title: { type: String, required: true },
    reward: { type: String, required: true },
    limitDate: { type: Date, required: false },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // Reference to Event model
    prestige : { type: String, required: false },
    isCollective: { type: Boolean, default: false },
    isAccepted: {type: Boolean, default : true}
});

module.exports = mongoose.model('Challenge', challengeSchema);
