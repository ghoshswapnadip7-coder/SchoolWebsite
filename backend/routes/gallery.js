const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();
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
        const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// POST New (Protected)
router.post('/', authenticate, async (req, res) => {
    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const { title, imageUrl, description } = req.body;
        const newItem = await prisma.galleryItem.create({
            data: { title, imageUrl, description }
        });
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create item' });
    }
});

// DELETE (Protected)
router.delete('/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        await prisma.galleryItem.delete({ where: { id: req.params.id } });
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

module.exports = router;
