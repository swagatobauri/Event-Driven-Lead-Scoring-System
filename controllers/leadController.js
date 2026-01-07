const Lead = require('../models/Lead');
const ScoreHistory = require('../models/ScoreHistory');
const Event = require('../models/Event');

exports.createLead = async (req, res) => {
    try {
        const lead = new Lead(req.body);
        await lead.save();
        res.status(201).json(lead);
    } catch (error) {
        res.status(500).json({ message: 'Error creating lead', error: error.message });
    }
};

exports.getLeads = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, sort = 'score', order = 'desc' } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        const leads = await Lead.find(query)
            .sort({ [sort]: order === 'desc' ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Lead.countDocuments(query);

        res.status(200).json({
            leads,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalLeads: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leads', error: error.message });
    }
};

exports.getLeadDetails = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        const [history, events] = await Promise.all([
            ScoreHistory.find({ leadId: lead._id }).sort({ timestamp: -1 }),
            Event.find({ leadId: lead._id }).sort({ timestamp: -1 })
        ]);

        res.status(200).json({ lead, history, events });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lead details', error: error.message });
    }
};
