const ScoringRule = require('../models/ScoringRule');

exports.getRules = async (req, res) => {
    try {
        const rules = await ScoringRule.find();
        res.status(200).json(rules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rules', error: error.message });
    }
};

exports.updateRule = async (req, res) => {
    const { eventType, points, isActive } = req.body;
    try {
        const rule = await ScoringRule.findOneAndUpdate(
            { eventType },
            { points, isActive },
            { upsert: true, new: true }
        );
        res.status(200).json(rule);
    } catch (error) {
        res.status(500).json({ message: 'Error updating rule', error: error.message });
    }
};
