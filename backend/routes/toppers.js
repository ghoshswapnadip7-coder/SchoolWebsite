const express = require('express');
const Topper = require('../models/Topper');
const router = express.Router();

// Get public list of toppers
router.get('/', async (req, res) => {
    try {
        const { year, class: className } = req.query;
        let query = {};
        if (year) query.year = year;
        if (className) query.class = className;

        const toppers = await Topper.find(query).sort({ year: -1, class: 1 });
        res.json(toppers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch toppers' });
    }
});

module.exports = router;
