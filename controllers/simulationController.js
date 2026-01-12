const Lead = require('../models/Lead');
const ScoringRule = require('../models/ScoringRule');
const scoringQueue = require('../queues/scoringQueue');

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
        const names = ['Viraj', 'Arko', 'Swagato', 'Ronit', 'Kushal'];
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

        // add to scoring queue directly
        await scoringQueue.add(payload, {
            attempts: 3,
            backoff: 5000,
            removeOnComplete: true
        });
        console.log(`[SIMULATOR] Queued ${randomEvent.type} for ${randomLead.name}`);
    } catch (error) {
        console.error('[SIMULATOR] Error queueing event:', error.message);
    }
}

exports.startSimulation = async (req, res) => {
    if (isRunning) {
        return res.status(400).json({ message: 'Simulation is already running' });
    }

    try {
        // Resume queue in case it was paused by a previous stop
        await scoringQueue.resume();

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

const ScoreHistory = require('../models/ScoreHistory');
const Event = require('../models/Event');

exports.stopSimulation = async (req, res) => {
    // 1. Stop generating new events locally
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    isRunning = false;

    // 2. Pause the queue to stop the worker immediately
    // 3. Clear waiting jobs to prevent backlog
    try {
        await scoringQueue.pause();
        await scoringQueue.empty();
        console.log('[SIMULATOR] Queue paused and flushed.');
    } catch (err) {
        console.error('[SIMULATOR] Failed to flush/pause queue:', err);
    }

    res.json({ message: 'Simulation stopped and queue paused', status: 'stopped' });
};

exports.resetSimulation = async (req, res) => {
    try {
        // Stop if running
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        isRunning = false;

        // Pause queue to prevent any in-flight jobs from processing after reset
        try {
            await scoringQueue.pause();
            await scoringQueue.empty();
        } catch (err) {
            console.error('[SIMULATOR] Error pausing/emptying queue on reset:', err);
        }

        // Clear DB
        await Promise.all([
            Lead.deleteMany({}),
            Event.deleteMany({}),
            ScoreHistory.deleteMany({})
        ]);

        // Reseed with new names
        await ensureRules();
        const leads = await ensureLeads();

        res.json({ message: 'System reset! New names generated.', leads });
    } catch (error) {
        res.status(500).json({ message: 'Reset failed', error: error.message });
    }
};

exports.getStatus = (req, res) => {
    res.json({ status: isRunning ? 'running' : 'stopped' });
};
