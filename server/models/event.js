const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },  // URL or path to the image
    challenges : { type: String, required: true }
});

module.exports = mongoose.model('Event', eventSchema);
