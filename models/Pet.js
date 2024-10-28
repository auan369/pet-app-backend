const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    // _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    petType: { type: String, required: true },
    hunger: { type: Number, default: 0 },
    happiness: { type: Number, default: 100 },
    health: { type: Number, default: 100 }, // Health level (0 - 100)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    poopCount: { type: Number, default: 0 }, // Number of poops
    isAlive: { type: Boolean, default: true }, // Pet's life status
    lastUpdated: { type: Date, default: Date.now }, // Timestamp for last state update

});

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
