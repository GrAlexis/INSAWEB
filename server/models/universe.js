const mongoose = require('mongoose');

const universeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    acceptedEmails: [{ type: String, required: true }],  // List of user emails
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]  // List of ObjectId references to events
});

module.exports = mongoose.model('Universe', universeSchema);
