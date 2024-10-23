const mongoose = require('mongoose');

const universeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    acceptedEmails: [{ type: String, required: true }],  // List of user emails
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],  // List of ObjectId references to events
    hashedPassword: { type: String, required: false },
    logo: { type: String, required: false }, 
    styles: { type: Map, of: String, required: false },  // Store custom CSS styles as key-value pairs
});

module.exports = mongoose.model('Universe', universeSchema);
