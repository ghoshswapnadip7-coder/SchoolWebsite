const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get public list of teachers
router.get('/teachers', async (req, res) => {
    try {
        const teachers = await User.find({ role: 'TEACHER' })
            .select('name bio subjects profilePic socialLinks gallery achievements email coverImage vlogs blogs')
            .sort({ name: 1 });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teachers' });
    }
});

// Get single teacher public profile
router.get('/teachers/:id', async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id)
            .select('name bio subjects profilePic socialLinks gallery achievements email coverImage vlogs blogs');
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teacher' });
    }
});

module.exports = router;
