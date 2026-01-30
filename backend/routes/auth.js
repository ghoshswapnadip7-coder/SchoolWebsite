const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RegistrationRequest = require('../models/RegistrationRequest');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-prod';

// Registration Application (Public)
router.post('/apply-registration', async (req, res) => {
    try {
        const { name, email, className, rollNumber, applicationType, previousStudentId, documents, password } = req.body;
        
        if (!name || !email || !className || !rollNumber || !applicationType || !password) {
            return res.status(400).json({ error: 'Core fields including password are required' });
        }

        // Fresh admission validation (ensure docs are present)
        if (applicationType === 'FRESH' && (!documents || !documents.aadharCard || !documents.pastMarksheet)) {
            return res.status(400).json({ error: 'Fresh admissions require Aadhar and Marksheet (Images/PDFs)' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const existingRequest = await RegistrationRequest.findOne({ email });
        if (existingRequest) return res.status(400).json({ error: 'Application already pending for this email' });

        let studentIdToUse;
        if (applicationType === 'PROMOTION' && previousStudentId) {
            studentIdToUse = previousStudentId;
        } else {
            // Auto-generate for FRESH
            const totalReqs = await RegistrationRequest.countDocuments();
            studentIdToUse = `RPHS${new Date().getFullYear()}${String(totalReqs + 101).padStart(4, '0')}`;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const request = await RegistrationRequest.create({
            name, 
            email, 
            studentId: studentIdToUse.toUpperCase(), 
            class: className, 
            rollNumber,
            applicationType,
            previousStudentId,
            documents: applicationType === 'FRESH' ? documents : undefined,
            password: hashedPassword
        });

        res.status(201).json({ 
            message: applicationType === 'FRESH' ? 'Fresh admission application submitted!' : 'Promotion request received!', 
            studentId: request.studentId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

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

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email, password: hashedPassword, role
        });

        const userObj = user.toJSON();
        const { password: _, ...userWithoutPassword } = userObj;
        res.status(201).json({ user: userWithoutPassword, message: 'User created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

        const user = await User.findOne({ email });
        if (!user) {
            // Check if they are in pending requests
            const pending = await RegistrationRequest.findOne({ email });
            if (pending) {
                // Check password if they chose one (hashed)
                const isMatch = await bcrypt.compare(password, pending.password);
                if (isMatch) {
                    return res.status(403).json({ 
                        error: 'PENDING_APPROVAL', 
                        message: 'Your registration is currently pending administrator approval.',
                        request: pending
                    });
                }
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ 
                error: 'ACCOUNT_BLOCKED', 
                message: 'Your account has been restricted by the administration.',
                reason: user.blockReason 
            });
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

        const userObj = user.toJSON();
        const { password: _, ...userInfo } = userObj;
        res.json({ user: userInfo, message: 'Login successful', token }); // Send token in body too for flexibility
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

module.exports = router;
