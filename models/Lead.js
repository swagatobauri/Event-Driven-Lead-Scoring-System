const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    company: {
        type: String,
        default: 'Unknown'
    },
    status: {
        type: String,
        enum: ['new', 'active', 'qualified', 'lost'],
        default: 'new'
    },
    score: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Lead', leadSchema);
