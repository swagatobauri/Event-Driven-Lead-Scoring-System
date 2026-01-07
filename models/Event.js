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
    },
    processed: {
        type: Boolean,
        default: false
    }
});

// we use event_id to prevent processing the same event twice (idempotency)
module.exports = mongoose.model('Event', eventSchema);
