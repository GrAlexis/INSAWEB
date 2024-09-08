const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String },
    lastName: { type: String },
    email: { type: String },
    hashedPassword: { type: String },
    classYear: { type: String, required: true },
    rank: { type: Number },
    balance: { type: Number, required: true },
    teamId: { type: String, default: null },
    eventPoints: { type: Map, of: Number, default: {} }, // Points par event_id
    isAdmin: { type: Boolean, default: false },
    pinnedChallenges: [{ type: String, default: [] }],
    secretQuestion: { type: String, required: true }, // La question secrète sélectionnée
    secretAnswer: { type: String, required: true }    // La réponse à la question secrète, idéalement hashée pour la sécurité
});

module.exports = mongoose.model('User', userSchema);
