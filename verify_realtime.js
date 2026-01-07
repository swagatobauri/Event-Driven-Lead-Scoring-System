const io = require('socket.io-client');
const axios = require('axios');
const mongoose = require('mongoose');
const ScoringRule = require('./models/ScoringRule');
const Lead = require('./models/Lead');
require('dotenv').config();

const SOCKET_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/api/events';

async function verifyRealtime() {
    // Setup DB
    await mongoose.connect(process.env.MONGO_URI);
    // Ensure rule exists
    await ScoringRule.findOneAndUpdate(
        { eventType: 'realtime_test' },
        { points: 50 },
        { upsert: true, new: true }
    );
    // Create new lead
    const lead = await new Lead({ name: 'Realtime User', email: `rt${Date.now()}@test.com` }).save();
    console.log(`Created Lead: ${lead._id}`);

    // Connect Socket
    const socket = io(SOCKET_URL);

    let eventReceived = false;

    socket.on('connect', () => {
        console.log('Connected to Socket.IO server');

        // Listen for updates
        socket.on('score_update', (data) => {
            console.log('Received score_update:', data);

            if (data.leadId === lead._id.toString() && data.pointsAdded === 50) {
                console.log('SUCCESS: Real-time update verified.');
                eventReceived = true;
                socket.disconnect();
                process.exit(0);
            }
        });

        // Send Event via API to trigger the update
        console.log('Sending event to trigger update...');
        axios.post(API_URL, {
            leadId: lead._id,
            eventData: {
                eventType: 'realtime_test',
                event_id: `rt_evt_${Date.now()}`
            }
        }).catch(err => {
            console.error('API Error:', err.message);
            process.exit(1);
        });
    });

    // Timeout
    setTimeout(() => {
        if (!eventReceived) {
            console.error('FAILED: Timed out waiting for socket event.');
            process.exit(1);
        }
    }, 10000);
}

verifyRealtime();
