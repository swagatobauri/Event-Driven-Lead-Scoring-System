const axios = require('axios');
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const ScoringRule = require('../models/ScoringRule');

const API_URL = 'http://localhost:3000/api/events';

const EVENT_TYPES = [
    { type: 'page_view', points: 1 },
    { type: 'click_cta', points: 5 },
    { type: 'download_whitepaper', points: 20 },
    { type: 'webinar_signup', points: 50 },
    { type: 'schedule_demo', points: 100 }
];

let intervalId = null;
let isRunning = false;

// make sure we have basic rules in the DB so points can be calculated
async function ensureRules() {
    for (const rule of EVENT_TYPES) {
        await ScoringRule.findOneAndUpdate(
            { eventType: rule.type },
            { points: rule.points },
            { upsert: true, new: true }
        );
    }
}

// create some dummy leads if none exist yet
async function ensureLeads() {
    const count = await Lead.countDocuments();
    if (count === 0) {
        const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan'];
        for (const name of names) {
            await new Lead({ name, email: `${name.toLowerCase()}@test.com` }).save();
        }
    }
    return await Lead.find();
}

async function runSimulationStep() {
    try {
        const leads = await Lead.find();
        if (leads.length === 0) return;

        // pick a random lead and a random event type
        const randomLead = leads[Math.floor(Math.random() * leads.length)];
        const randomEvent = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];

        const payload = {
            leadId: randomLead._id,
            eventData: {
                eventType: randomEvent.type,
                // generate a unique id for the event
                event_id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                metadata: { source: 'simulator_ui' }
            }
        };

        // send it to the event ingestion API
        await axios.post(API_URL, payload);
        console.log(`[SIMULATOR] Sent ${randomEvent.type} for ${randomLead.name}`);
    } catch (error) {
        console.error('[SIMULATOR] Error sending event:', error.message);
    }
}

exports.startSimulation = async (req, res) => {
    if (isRunning) {
        return res.status(400).json({ message: 'Simulation is already running' });
    }

    try {
        await ensureRules();
        await ensureLeads();

        isRunning = true;
        // Run every 1 second
        intervalId = setInterval(runSimulationStep, 1000);

        res.json({ message: 'Simulation started', status: 'running' });
    } catch (error) {
        res.status(500).json({ message: 'Error starting simulation', error: error.message });
    }
};

exports.stopSimulation = (req, res) => {
    if (!isRunning) {
        return res.status(400).json({ message: 'Simulation is not running' });
    }

    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    isRunning = false;

    res.json({ message: 'Simulation stopped', status: 'stopped' });
};

exports.getStatus = (req, res) => {
    res.json({ status: isRunning ? 'running' : 'stopped' });
};
