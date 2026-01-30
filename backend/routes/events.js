const express = require('express');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-prod';

// Middleware to check auth
const authenticate = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// GET All
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// POST New (Protected)
router.post('/', authenticate, async (req, res) => {
    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const { title, description, date, location, imageUrl } = req.body;
        const newEvent = await Event.create({
            title,
            description,
            date: new Date(date),
            location,
            imageUrl
        });
        res.status(201).json(newEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// DELETE (Protected)
router.delete('/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// PUT Update (Protected)
router.put('/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const { title, description, date, location, imageUrl } = req.body;
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            { 
                title, 
                description, 
                date: date ? new Date(date) : undefined, 
                location, 
                imageUrl 
            },
            { new: true }
        );
        res.json(updatedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

module.exports = router;
