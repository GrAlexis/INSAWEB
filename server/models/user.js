const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastname : {type:String, required : true},
    hashedpassword : {type: String, required: true}
    classYear: { type: String, required: true },
    rank: { type: Number},
    balance: { type: Number, required: true },
    teamId: {type: String, default: null },
    eventPoints: { type: Map, of: Number, default: {} }, // Points par event_id
    isAdmin: { type: Boolean, default: false },
    pinnedChallenges: [{ type: String, default: [] }]
});

module.exports = mongoose.model('User', userSchema);
