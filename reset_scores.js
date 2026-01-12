const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const Event = require('./models/Event');
const ScoreHistory = require('./models/ScoreHistory');
require('dotenv').config();

async function resetScores() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        // 1. Clear History
        console.log('Clearing Score History...');
        await ScoreHistory.deleteMany({});

        // 2. Clear Events (so idempotency doesn't block re-runs)
        console.log('Clearing Events...');
        await Event.deleteMany({});

        // 3. Reset Leads (Delete them so we can regenerate new names)
        console.log('Clearing Leads...');
        await Lead.deleteMany({});

        console.log('System Reset Complete. You can run the simulation again.');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting system:', error);
        process.exit(1);
    }
}

resetScores();
