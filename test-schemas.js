const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const Event = require('./models/Event');
const ScoreHistory = require('./models/ScoreHistory');
const ScoringRule = require('./models/ScoringRule');
require('dotenv').config();

async function testSchemas() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for testing');

        // Clear 
        await Lead.deleteMany({});
        await Event.deleteMany({});
        await ScoreHistory.deleteMany({});
        await ScoringRule.deleteMany({});

        // 1. Create a Lead
        const lead = new Lead({ name: 'Test User', email: 'test@example.com' });
        await lead.save();
        console.log('Lead created:', lead);

        // 2. Create Scoring Rule
        const rule = new ScoringRule({ eventType: 'page_view', points: 5 });
        await rule.save();
        console.log('Rule created:', rule);

        // 3.  Event
        const event = new Event({
            leadId: lead._id,
            eventType: 'page_view',
            event_id: 'unique_event_123',
            metadata: { page: '/pricing' }
        });
        await event.save();
        console.log('Event created:', event);

        // 4. Test Idempotency (Duplicate Event)
        try {
            const duplicateEvent = new Event({
                leadId: lead._id,
                eventType: 'page_view',
                event_id: 'unique_event_123', // Same ID
            });
            await duplicateEvent.save();
        } catch (err) {
            if (err.code === 11000) {
                console.log('SUCCESS: Prevented duplicate event creation.');
            } else {
                console.error('FAILED: Unexpected error on duplicate event:', err);
            }
        }

        // 5. Create Score History
        const history = new ScoreHistory({
            leadId: lead._id,
            scoreChange: 5,
            reason: 'Event: page_view'
        });
        await history.save();
        console.log('Score History created:', history);

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await mongoose.connection.close();
    }
}

testSchemas();