const scoringQueue = require('../queues/scoringQueue');
const Event = require('../models/Event');

exports.ingestEvent = async (req, res) => {
    try {
        const { leadId, eventData } = req.body;

        if (!leadId || !eventData) {
            return res.status(400).json({ message: 'Missing leadId or eventData' });
        }

        await scoringQueue.add({ leadId, eventData }, {
            attempts: 3,
            backoff: 5000,
            removeOnComplete: true
        });

        res.status(202).json({ message: 'Event accepted for processing' });
    } catch (error) {
        console.error('Ingest Error:', error);
        res.status(500).json({ message: 'Error processing event', error: error.message });
    }
};

// Webhook Handler (External Services)
exports.handleWebhook = async (req, res) => {
    try {
        const payload = req.body;

        // Normalize payload: Expect external system to provide lead identifier (email) and event details
        // This is a simplified example. In production, you'd verify signatures.
        const { email, type, id, metadata } = payload;

        if (!email || !type) {
            return res.status(400).json({ message: 'Invalid webhook payload' });
        }

        // We need to resolve Lead ID from email logic or let the worker handle it?
        // Ideally, we resolve it here or pass email to worker. 
        // For simplicity, let's assume we need to resolve it or pass a flag.
        // But our worker expects `leadId`. Let's pass `email` in eventData and handle lookup in worker?
        // Or better: Lookup here quickly.

        // Actually, to keep ingestion fast, we should just queue it.
        // But our current worker strictly needs `leadId`. 
        // Let's modify the worker later to accept email. 
        // For now, let's try to find the lead.

        // Optimization: Just queue raw data and let a "WebhookWorker" normalize it?
        // Reusing scoringQueue: We need to standardize the job format.
        // Let's assume for this specific requirement, the webhook sends `leadId` or we lookup.

        // Let's assume the user sends `leadId` in webhook for now to match current architecture,
        // or we perform a quick lookup.
        const Lead = require('../models/Lead');
        let lead = await Lead.findOne({ email });

        if (!lead) {
            // Option: Create lead on the fly?
            lead = await new Lead({ email, name: 'Unknown Webhook User' }).save();
        }

        await scoringQueue.add({
            leadId: lead._id,
            eventData: {
                eventType: type,
                event_id: id || `wh_${Date.now()}_${Math.random()}`,
                metadata
            }
        });

        res.status(200).json({ message: 'Webhook received' });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ message: 'Error processing webhook' });
    }
};

// Batch Upload Handler
exports.handleBatchUpload = async (req, res) => {
    try {
        const { events } = req.body; // Expect JSON array of events

        if (!Array.isArray(events)) {
            return res.status(400).json({ message: 'Expected array of events' });
        }

        console.log(`Received batch of ${events.length} events`);

        const jobs = events.map(event => ({
            name: 'batch-event',
            data: {
                leadId: event.leadId,
                eventData: event.eventData
            }
        }));

        await scoringQueue.addBulk(jobs);

        res.status(202).json({ message: `Batch of ${events.length} events queued` });
    } catch (error) {
        res.status(500).json({ message: 'Error processing batch', error: error.message });
    }
};
