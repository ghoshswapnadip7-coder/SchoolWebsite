const express = require('express');
const Result = require('../models/Result');
const Routine = require('../models/Routine');
const Event = require('../models/Event');
const StudentRequest = require('../models/StudentRequest');
const RegistrationRequest = require('../models/RegistrationRequest');
const ExamSheet = require('../models/ExamSheet');
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
        const results = await Result.find({ user: req.user.userId, isPublished: true });
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

// Get my requests (excluding deleted) + Registration Requests (Promotions likely)
router.get('/requests', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        // Fetch Support Requests
        const supportRequests = await StudentRequest.find({ 
            user: userId,
            isHiddenFromStudent: { $ne: true }
        }).sort({ createdAt: -1 });

        // Fetch Registration/Promotion Requests linked to this student ID
        let registrationRequests = [];
        if (user && user.studentId) {
            const regReqs = await RegistrationRequest.find({ previousStudentId: user.studentId });
            
            // Map to common structure
            registrationRequests = regReqs.map(r => ({
                id: r._id,
                subject: r.applicationType === 'PROMOTION' ? `Promotion to Class ${r.class}` : `Application for Class ${r.class}`,
                description: `Applied on ${new Date(r.createdAt).toLocaleDateString()}. Status: ${r.status}`,
                type: 'APPLICATION',
                status: r.status === 'ACCEPTED' ? 'APPROVED' : (r.status === 'REJECTED' ? 'DECLINED' : 'PENDING'),
                adminComment: r.adminComment,
                createdAt: r.createdAt
            }));
        }

        // Combine and sort
        const allRequests = [...supportRequests, ...registrationRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(allRequests);
    } catch (error) {
        console.error('Fetch Requests Error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});


// --- PERFORMANCE & EXAM SHEETS ---

// Get personal exam sheets
router.get('/exam-sheets', authenticate, async (req, res) => {
    try {
        const sheets = await ExamSheet.find({ user: req.user.userId }).sort({ examDate: -1 });
        res.json(sheets);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Get performance data (Results grouped by semester for graph)
router.get('/performance', authenticate, async (req, res) => {
    try {
        const results = await Result.find({ user: req.user.userId, isPublished: true });
        
        // Group by className and semester and calculate average or total
        const performance = results.reduce((acc, curr) => {
            const key = `${curr.className} - ${curr.semester}`;
            if (!acc[key]) acc[key] = { total: 0, count: 0, subjects: [], className: curr.className, semester: curr.semester };
            acc[key].total += curr.marks;
            acc[key].count += 1;
            acc[key].subjects.push({ name: curr.subject, marks: curr.marks });
            return acc;
        }, {});

        // Convert to array and format for chart
        const chartData = Object.values(performance).map(data => ({
            label: `${data.className} ${data.semester.split(' ')[0]}`,
            average: Math.round(data.total / data.count),
            total: data.total,
            className: data.className,
            semester: data.semester
        })).sort((a, b) => {
            // Sort by class then semester (basic string sort for now)
            return a.label.localeCompare(b.label);
        });

        res.json(chartData);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

const Notice = require('../models/Notice');

// Get Notices relevant to the student
router.get('/notices', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const commonCriteria = {
            status: { $in: ['PUBLISHED', null] }, // Handle missing status
            $or: [
                { scheduledFor: { $exists: false } },
                { scheduledFor: { $lte: new Date() } }
            ]
        };

        const criteria = [
            { targetType: 'ALL', ...commonCriteria }
        ];
        
        if (user.class) {
            criteria.push({ 
                targetType: 'CLASS', 
                targetId: { $regex: new RegExp(`^${user.class}$`, 'i') },
                ...commonCriteria
            });
        }
        
        if (user.studentId) {
            criteria.push({ 
                targetType: 'STUDENT', 
                targetId: { $regex: new RegExp(`^${user.studentId}$`, 'i') },
                ...commonCriteria
            });
        }

        const notices = await Notice.find({ $or: criteria }).sort({ createdAt: -1 });

        res.json(notices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notices' });
    }
});

module.exports = router;
