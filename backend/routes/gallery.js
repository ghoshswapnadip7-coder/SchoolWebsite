const express = require('express');
const GalleryItem = require('../models/GalleryItem');
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
        const items = await GalleryItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// POST New (Protected)
router.post('/', authenticate, async (req, res) => {
    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const { title, imageUrl, description, category } = req.body;
        const newItem = await GalleryItem.create({
            title, imageUrl, description, category
        });
        res.status(201).json(newItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create item' });
    }
});

// DELETE (Protected)
router.delete('/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        await GalleryItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// PUT Update (Protected)
router.put('/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const { title, imageUrl, description, category } = req.body;
        const updatedItem = await GalleryItem.findByIdAndUpdate(
            req.params.id,
            { title, imageUrl, description, category },
            { new: true }
        );
        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

module.exports = router;
