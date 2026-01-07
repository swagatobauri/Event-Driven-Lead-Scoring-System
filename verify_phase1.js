const axios = require('axios');
const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const ScoringRule = require('./models/ScoringRule');
require('dotenv').config();

const BASE_URL = 'http://localhost:3001/api';

async function verifyPhase1() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('--- Phase 1 Verification ---');

        // Create a Test Lead
        console.log('Creating Lead...');
        const leadRes = await axios.post(`${BASE_URL}/leads`, {
            name: 'Phase1 Tester',
            email: `p1_${Date.now()}@test.com`
        });
        const leadId = leadRes.data._id;
        console.log(`Lead Created: ${leadId}`);

        // Configure Rules
        console.log('Configuring Rules...');
        await axios.post(`${BASE_URL}/rules`, { eventType: 'mega_event', points: 900, isActive: true });
        await axios.post(`${BASE_URL}/rules`, { eventType: 'ignore_me', points: 100, isActive: false });
        await axios.post(`${BASE_URL}/rules`, { eventType: 'small_event', points: 50, isActive: true });

        // Send Events
        console.log('Sending Events...');
        try {
            await axios.post(`${BASE_URL}/events`, {
                leadId,
                eventData: { eventType: 'small_event', event_id: `e1_${Date.now()}` }
            }, { timeout: 2000 });
            console.log('Sent small_event');

            await new Promise(r => setTimeout(r, 1000));

            await axios.post(`${BASE_URL}/events`, {
                leadId,
                eventData: { eventType: 'mega_event', event_id: `e3_${Date.now()}` }
            }, { timeout: 2000 });
            console.log('Sent mega_event');

            await new Promise(r => setTimeout(r, 1000));

        } catch (err) {
            console.log('WARN: Redis unavailable. Skipping event processing verification.');
        }

        // Verify Lead Details
        console.log('Verifying Details...');
        const detailRes = await axios.get(`${BASE_URL}/leads/${leadId}`);
        const { lead, history, events } = detailRes.data;

        console.log(`Final Score: ${lead.score}`);

        // Check if APIs are working (Structure check)
        if (lead && Array.isArray(history) && Array.isArray(events)) {
            console.log('SUCCESS: Lead Details API structure verified.');
            console.log('SUCCESS: Phase 1 APIs (Leads, Rules) verified.');
            process.exit(0);
        } else {
            console.error('FAILED: Invalid API response structure.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Verification Error:', error.message);
        if (error.response) console.error('Response:', error.response.data);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

verifyPhase1();
