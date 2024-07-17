const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    classYear: { type: String, required: true },
    rank: { type: Number, required: true },
    balance: { type: Number, required: true }
});

module.exports = mongoose.model('User', userSchema);
