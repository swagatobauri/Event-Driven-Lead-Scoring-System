const Lead = require('../models/Lead');
const Event = require('../models/Event');

exports.getDashboardStats = async (req, res) => {
    try {
        // fetch everything at once for speed
        const [totalLeads, topLeads, totalEvents] = await Promise.all([
            Lead.countDocuments(),
            Lead.find().sort({ score: -1 }).limit(5),
            Event.countDocuments()
        ]);

        res.status(200).json({
            totalLeads,
            totalEvents,
            topLeads
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};
