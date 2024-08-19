const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    eventId: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    points: { type: Number},
    maxMembers: { type: Number }
});

module.exports = mongoose.model('Team', teamSchema);
