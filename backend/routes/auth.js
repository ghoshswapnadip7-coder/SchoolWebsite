const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-prod';

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, secretKey } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (role === 'TEACHER' && secretKey !== 'TEACHER123') {
            return res.status(403).json({ error: 'Invalid Teacher Secret Key' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role }
        });

        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({ user: userWithoutPassword, message: 'User created' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role, name: user.name },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        const { password: _, ...userInfo } = user;
        res.json({ user: userInfo, message: 'Login successful', token }); // Send token in body too for flexibility
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

module.exports = router;
