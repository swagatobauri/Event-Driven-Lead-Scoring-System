const mongoose = require('mongoose');

const scoringRuleSchema = new mongoose.Schema({
    eventType: {
        type: String,
        required: true,
        unique: true
    },
    points: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('ScoringRule', scoringRuleSchema);
