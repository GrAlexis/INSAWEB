const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    image: { type: String, required: true }, 
    challenges : { type: String, required: true },
    teams: [{ type: String }]
});

module.exports = mongoose.model('Event', eventSchema);
