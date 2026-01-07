const axios = require('axios');
const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const ScoringRule = require('./models/ScoringRule');
require('dotenv').config();

const API_URL = 'http://localhost:3000/api/events';

const EVENT_TYPES = [
    { type: 'page_view', points: 1 },
    { type: 'click_cta', points: 5 },
    { type: 'download_whitepaper', points: 20 },
    { type: 'webinar_signup', points: 50 },
    { type: 'schedule_demo', points: 100 }
];

async function setupRules() {
    console.log('Setting up scoring rules...');
    await mongoose.connect(process.env.MONGO_URI);

    for (const rule of EVENT_TYPES) {
        await ScoringRule.findOneAndUpdate(
            { eventType: rule.type },
            { points: rule.points },
            { upsert: true, new: true }
        );
    }
    console.log('Rules ensured.');
}

async function getLeads() {
    return await Lead.find();
}

async function simulate() {
    try {
        await setupRules();
        let leads = await getLeads();

        if (leads.length === 0) {
            console.log('No leads found. Creating some...');
            const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan'];
            for (const name of names) {
                await new Lead({ name, email: `${name.toLowerCase()}@test.com` }).save();
            }
            leads = await getLeads();
        }

        console.log(`Starting simulation with ${leads.length} leads...`);
        console.log('Press Ctrl+C to stop.');

        // Function to send a random event
        const sendEvent = async () => {
            const randomLead = leads[Math.floor(Math.random() * leads.length)];
            const randomEvent = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];

            const payload = {
                leadId: randomLead._id,
                eventData: {
                    eventType: randomEvent.type,
                    event_id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    metadata: { source: 'simulator' }
                }
            };

            try {
                await axios.post(API_URL, payload);
                console.log(`[SENT] ${randomEvent.type} for ${randomLead.name} (+${randomEvent.points} pts)`);
            } catch (err) {
                console.error(`[ERROR] Failed to send event: ${err.message}`);
                // If network error, maybe server is down
            }
        };

        // Send an event every 0.5 to 2 seconds
        setInterval(sendEvent, 1000);

    } catch (err) {
        console.error('Simulation setup error:', err);
    }
}

simulate();
