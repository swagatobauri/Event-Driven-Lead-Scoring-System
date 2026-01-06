const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    eventType: {
        type: String,
        required: true
    },
    event_id: {
        type: String,
        required: true,
        unique: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Event_id should be unique to ensure idempotency (we don't process the same event twice)
module.exports = mongoose.model('Event', eventSchema);
