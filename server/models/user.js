const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String },
    lastName: { type: String },
    email: { type: String },
    active: { type: Boolean, default: false },
    hashedPassword: { type: String },
    classYear: { type: String, required: true },
    rank: { type: Number },
    balance: { type: Number },
    teamIdByEvent: { type: Map, of: String, default: {} }, // Map eventId -> teamId
    universes: { 
        type: Map, 
        of: new mongoose.Schema({
            events: {
                type: Map,
                of: new mongoose.Schema({
                    teamId: { type: String },
                    points: { type: Number },
                    pinnedChallenges: [{ type: String, default: [] }]
                }, { _id: false }) // Disable automatic ID generation for nested schema
            }
        }), 
        default: {}
    },
    isAdmin: { type: Boolean, default: false },
    pinnedChallenges: [{ type: String, default: [] }],
    secretQuestion: { type: String, default: '' },
    secretAnswer: { type: String, default: '' }
});

module.exports = mongoose.model('User', userSchema);
