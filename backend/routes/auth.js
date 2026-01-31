const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RegistrationRequest = require('../models/RegistrationRequest');
const AdmissionSetting = require('../models/AdmissionSetting');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-prod';

// Registration Application (Public)
router.post('/apply-registration', async (req, res) => {
    try {
        // Check Admission Settings
        const settings = await AdmissionSetting.findOne();
        const now = new Date();
        
        if (!settings || !settings.isOpen || (settings.expiryDate && now > settings.expiryDate)) {
            return res.status(403).json({ 
                error: 'Admissions Closed', 
                message: 'Admissions are currently closed or have expired for this term.' 
            });
        }

        const { name, email, className, rollNumber, applicationType, previousStudentId, documents, password, stream, subjects } = req.body;
        
        // Check if class is allowed
        if (settings.allowedClasses && settings.allowedClasses.length > 0 && !settings.allowedClasses.includes(className)) {
            return res.status(403).json({ 
                error: 'Admissions Closed for this Class', 
                message: `Admissions for ${className} are not currently active.` 
            });
        }
        
        if (!name || !email || !className || !rollNumber || !applicationType || !password) {
            return res.status(400).json({ error: 'Core fields including password are required' });
        }

        // Fresh admission validation (ensure docs are present)
        if (applicationType === 'FRESH' && (!documents || !documents.aadharCard || !documents.pastMarksheet)) {
            return res.status(400).json({ error: 'Fresh admissions require Aadhar and Marksheet (Images/PDFs)' });
        }

        // Remove email uniqueness checks as per user request (siblings can share parent email)
        
        let studentIdToUse;
        if (applicationType === 'PROMOTION' && previousStudentId) {
            studentIdToUse = previousStudentId;
            // Check if this student already has a pending request
            const existingRequest = await RegistrationRequest.findOne({ studentId: studentIdToUse, status: 'PENDING' });
            if (existingRequest) return res.status(400).json({ error: 'A promotion request is already pending for this ID' });
        } else {
            // Auto-generate for FRESH
            const totalStudents = await User.countDocuments({ role: 'STUDENT' });
            const totalReqs = await RegistrationRequest.countDocuments();
            studentIdToUse = `RPHS${new Date().getFullYear()}${String(totalStudents + totalReqs + 101).padStart(4, '0')}`;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const request = await RegistrationRequest.create({
            name, 
            email, 
            studentId: studentIdToUse.toUpperCase(), 
            class: className, 
            rollNumber,
            stream,
            subjects,
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

        // Identification is now primarily handled by IDs/Roles rather than unique emails

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
        const { email, password } = req.body; // email field might contain studentId
        if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

        // Search by email OR studentId
        const user = await User.findOne({ 
            $or: [
                { email: email }, 
                { studentId: email } // Allow ID-based login
            ] 
        });

        if (!user) {
            // Check pending requests
            const pending = await RegistrationRequest.findOne({ 
                $or: [
                    { email: email }, 
                    { studentId: email }
                ],
                status: 'PENDING'
            });
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

// Check User Status (Polling)
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded.userId);

        if (!user) return res.status(401).json({ error: 'User not found' });

        if (user.isBlocked) {
            return res.status(403).json({ 
                error: 'ACCOUNT_BLOCKED', 
                message: 'Your account has been restricted.',
                reason: user.blockReason 
            });
        }

        res.json({ status: 'ACTIVE', user: { id: user.id, role: user.role, name: user.name } });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

// Get Public Admission Status
router.get('/admission-status', async (req, res) => {
    try {
        const settings = await AdmissionSetting.findOne();
        if (!settings) return res.json({ isOpen: false });
        
        const now = new Date();
        const isActive = settings.isOpen && (!settings.expiryDate || now <= settings.expiryDate);
        
        res.json({
            isOpen: isActive,
            expiryDate: settings.expiryDate,
            allowedClasses: settings.allowedClasses || []
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

module.exports = router;
