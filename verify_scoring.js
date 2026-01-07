const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// We need direct DB access to set up test data (Rule)
// But we'll use API to trigger the event
const ScoringRule = require('./models/ScoringRule');
const Lead = require('./models/Lead');
const Event = require('./models/Event'); // To clean up if needed

const API_URL = 'http://localhost:3000/api/events';

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for setup');

        // Clean up previous test data if any
        await ScoringRule.deleteMany({ eventType: 'test_action' });

        // Create a Scoring Rule
        console.log('Creating scoring rule...');
        await new ScoringRule({ eventType: 'test_action', points: 10 }).save();

        // Create a Lead
        // Let's use direct DB for speed in setup
        const lead = await new Lead({ name: 'Scoring Tester', email: `scorer${Date.now()}@test.com` }).save();
        console.log(`Created Lead: ${lead._id} with score: ${lead.score}`);

        // Send Event via API
        const eventId = `evt_${Date.now()}`;
        console.log(`Sending event ${eventId}...`);

        await axios.post(API_URL, {
            leadId: lead._id,
            eventData: {
                eventType: 'test_action',
                event_id: eventId,
                metadata: { source: 'verify_script' }
            }
        });

        console.log('Event sent. Waiting for worker to process...');
        await new Promise(r => setTimeout(r, 2000)); // Wait 2s

        // Check Lead Score
        const updatedLead = await Lead.findById(lead._id);
        console.log(`Lead Score after event: ${updatedLead.score}`);

        if (updatedLead.score === 10) {
            console.log('SUCCESS: Score updated correctly.');
        } else {
            console.error(`FAILED: Expected score 10, got ${updatedLead.score}`);
            process.exit(1);
        }

        // Test Duplicate (Idempotency)
        console.log('Sending DUPLICATE event...');
        await axios.post(API_URL, {
            leadId: lead._id,
            eventData: {
                eventType: 'test_action',
                event_id: eventId, // SAME ID
                metadata: { source: 'verify_script' }
            }
        });

        console.log('Duplicate sent. Waiting...');
        await new Promise(r => setTimeout(r, 2000));

        const leadAfterDup = await Lead.findById(lead._id);
        console.log(`Lead Score after duplicate: ${leadAfterDup.score}`);

        if (leadAfterDup.score === 10) {
            console.log('SUCCESS: Score did not change (Idempotency Verification Passed).');
        } else {
            console.error(`FAILED: Score changed to ${leadAfterDup.score}, expected 10.`);
            process.exit(1);
        }

    } catch (error) {
        console.error('Verification Error:', error.message);
        if (error.response) console.error('API Response:', error.response.data);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('DB Connection closed');
    }
}

verify();
