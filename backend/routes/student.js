const express = require('express');
const Result = require('../models/Result');
const Routine = require('../models/Routine');
const Event = require('../models/Event');
const StudentRequest = require('../models/StudentRequest');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Payment = require('../models/Payment');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-prod';

// Middleware to check auth and block status
const authenticate = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // Check if user is blocked
        const user = await User.findById(decoded.userId);
        if (user && user.isBlocked) {
            return res.status(403).json({ 
                error: 'Account Restricted', 
                message: user.blockReason || 'Your account is blocked. Please contact the administrative office for more details.', 
                isBlocked: true 
            });
        }
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get User Profile (including fees)
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Simulate Payment
router.post('/pay-fees', authenticate, async (req, res) => {
    try {
        const { amount, semester, paymentMethod } = req.body;
        const user = await User.findById(req.user.userId);
        
        // Create Payment record
        const payment = await Payment.create({
            user: user._id,
            amount: amount || user.feesAmount,
            transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            semester: semester || 'Current Term',
            paymentMethod: paymentMethod || 'UPI'
        });

        // Update User status
        user.isFeesPaid = true;
        user.feesAmount = 0;
        await user.save();

        res.json({ message: 'Payment successful', payment });
    } catch (error) {
        res.status(500).json({ error: 'Payment failed' });
    }
});

// Get Payment History
router.get('/payments', authenticate, async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user.userId }).sort({ paymentDate: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Get User Results
router.get('/results', authenticate, async (req, res) => {
    try {
        const results = await Result.find({ user: req.user.userId });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// Get Routine for a class
router.get('/routine/:className', async (req, res) => {
    try {
        const routine = await Routine.find({ class: req.params.className });
        res.json(routine);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch routine' });
    }
});

// Get Exams (categorized as EXAM in Event model)
router.get('/exams', async (req, res) => {
    try {
        // Find events that are exams
        // For now, let's just assume we can filter by title or description containing 'Exam'
        // or we could add a category field to Event model if we haven't already
        const exams = await Event.find({ 
            $or: [
                { title: { $regex: 'Exam', $options: 'i' } },
                { description: { $regex: 'Exam', $options: 'i' } }
            ]
        }).sort({ date: 1 });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// --- Student Requests (Leave, etc.) ---

// Create a request
router.post('/requests', authenticate, async (req, res) => {
    try {
        const { subject, description, type, requestedProfilePic } = req.body;
        const request = await StudentRequest.create({
            user: req.user.userId,
            subject,
            description,
            type,
            requestedProfilePic
        });
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create request' });
    }
});

// Get my requests (excluding deleted)
router.get('/requests', authenticate, async (req, res) => {
    try {
        const requests = await StudentRequest.find({ 
            user: req.user.userId,
            isHiddenFromStudent: { $ne: true }
        }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Soft delete (hide) request
router.delete('/requests/:id', authenticate, async (req, res) => {
    try {
        const request = await StudentRequest.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },
            { isHiddenFromStudent: true },
            { new: true }
        );
        if (!request) return res.status(404).json({ error: 'Request not found' });
        res.json({ message: 'Request removed from dashboard' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete request' });
    }
});

module.exports = router;
