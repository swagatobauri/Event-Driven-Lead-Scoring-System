const Queue = require('bull');
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Event = require('../models/Event');
const ScoringRule = require('../models/ScoringRule');
const ScoreHistory = require('../models/ScoreHistory');
const { getIO } = require('../utils/socket');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Worker connected to MongoDB'))
    .catch(err => console.error('Worker MongoDB connection error:', err));

const scoringQueue = new Queue('scoring-queue', {
    redis: { port: 6379, host: '127.0.0.1' }
});

const MAX_SCORE = 1000;

scoringQueue.process(async (job) => {
    const { leadId, eventData } = job.data;
    const { eventType, event_id, metadata } = eventData;

    try {
        // first, check if we've already seen this event to avoid double counting
        const existingEvent = await Event.findOne({ event_id });
        if (existingEvent) {
            console.log(`Duplicate event skipped: ${event_id}`);
            return;
        }

        // log the event first but mark as unprocessed until we calculate points
        const newEvent = new Event({
            leadId,
            eventType,
            event_id,
            metadata,
            processed: false
        });
        await newEvent.save();

        // find how many points this event is worth
        const rule = await ScoringRule.findOne({ eventType });
        if (!rule) {
            // strange, we don't have a rule for this event type. 
            // just mark it processed and move on.
            console.log(`No scoring rule found for: ${eventType}`);
            newEvent.processed = true;
            await newEvent.save();
            return;
        }

        if (!rule.isActive) {
            newEvent.processed = true;
            await newEvent.save();
            return;
        }

        const lead = await Lead.findById(leadId);
        if (lead) {
            const oldScore = lead.score;
            let newScore = oldScore + rule.points;

            // cap the score so it doesn't grow infinitely
            if (newScore > MAX_SCORE) {
                newScore = MAX_SCORE;
            }

            // only update and broadcast if the score actually changed
            if (newScore !== oldScore) {
                lead.score = newScore;
                await lead.save();

                // save this change to history so we can show a timeline later
                await new ScoreHistory({
                    leadId: lead._id,
                    scoreChange: newScore - oldScore,
                    newScore,
                    reason: `Event: ${eventType}`
                }).save();

                console.log(`Updated lead ${lead.name} score to ${newScore}`);

                // let the frontend know immediately
                const io = getIO();
                if (io) {
                    io.emit('score_update', {
                        leadId: lead._id,
                        newScore,
                        leadName: lead.name
                    });
                }
            }
        }

        // all done, mark event as fully processed
        newEvent.processed = true;
        await newEvent.save();

    } catch (error) {
        // if something crashed, let Bull know so it can retry later
        console.error(`Error processing job ${job.id}:`, error);
        throw error;
    }
});

console.log('Worker started. Listening for events...');
