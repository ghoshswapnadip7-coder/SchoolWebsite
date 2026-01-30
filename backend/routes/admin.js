const express = require('express');
const User = require('../models/User');
const Routine = require('../models/Routine');
const Result = require('../models/Result');
const RegistrationRequest = require('../models/RegistrationRequest');
const StudentRequest = require('../models/StudentRequest');
const Payment = require('../models/Payment');
const { sendApprovalEmail } = require('../utils/email'); // Import Email Service
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-prod';

// Middleware to check Admin auth
const authenticateAdmin = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// --- Student Management ---

// Get all students
router.get('/students', authenticateAdmin, async (req, res) => {
    try {
        const students = await User.find({ role: 'STUDENT' }).select('-password').sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Add new student
router.post('/students', authenticateAdmin, async (req, res) => {
    try {
        const { name, email, password, studentId, className, rollNumber } = req.body;
        
        const existing = await User.findOne({ $or: [{ email }, { studentId }] });
        if (existing) return res.status(400).json({ error: 'Email or Student ID already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const student = await User.create({
            name,
            email,
            password: hashedPassword,
            studentId,
            class: className,
            rollNumber,
            role: 'STUDENT'
        });

        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create student' });
    }
});

// Delete student
router.delete('/students/:id', authenticateAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        // Also clean up their results
        await Result.deleteMany({ user: req.params.id });
        res.json({ message: 'Student deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

// --- Result Management ---

// Get results for a specific student
router.get('/results/:studentId', authenticateAdmin, async (req, res) => {
    try {
        const results = await Result.find({ user: req.params.studentId });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// Add new result
router.post('/results', authenticateAdmin, async (req, res) => {
    try {
        const { userId, subject, marks, grade, semester } = req.body;
        const result = await Result.create({ user: userId, subject, marks, grade, semester });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add result' });
    }
});

// Update result
router.put('/results/:id', authenticateAdmin, async (req, res) => {
    try {
        const { subject, marks, grade, semester } = req.body;
        const result = await Result.findByIdAndUpdate(req.params.id, { subject, marks, grade, semester }, { new: true });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update result' });
    }
});

// Delete result
router.delete('/results/:id', authenticateAdmin, async (req, res) => {
    try {
        await Result.findByIdAndDelete(req.params.id);
        res.json({ message: 'Result deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete result' });
    }
});

// --- Registration Requests Management ---

// Get all registration requests
router.get('/registration-requests', authenticateAdmin, async (req, res) => {
    try {
        const requests = await RegistrationRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch registration requests' });
    }
});

// Accept registration request
router.post('/registration-requests/:id/accept', authenticateAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const request = await RegistrationRequest.findById(id);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        // Check if user already exists
        const existing = await User.findOne({ email: request.email });
        
        if (!existing) {
            // High security: ensure we have a password (fallback for older requests)
            const finalPassword = request.password || await bcrypt.hash('student123', 10);

            // Assign Auto-Increment Roll Number for the specific class
            const lastStudentInClass = await User.findOne({ class: request.class }).sort({ rollNumber: -1 });
            const neRoll = lastStudentInClass && !isNaN(lastStudentInClass.rollNumber) 
                ? Number(lastStudentInClass.rollNumber) + 1 
                : 1;

            // Create the student account
            await User.create({
                name: request.name,
                email: request.email,
                password: finalPassword, 
                studentId: request.studentId,
                class: request.class,
                rollNumber: neRoll, // Assign calculated roll
                stream: request.stream,
                subjects: request.subjects,
                role: 'STUDENT'
            });
            
            // Send Approval Email
            await sendApprovalEmail(
                request.email, 
                request.name, 
                request.studentId, 
                request.stream, // e.g. 'Science'
                request.subjects // e.g. ['Physics', 'Chemistry']
            );
            
            console.log(`[EMAIL SENT] To: ${request.email} | Subject: Admission Approved`);
        } else {
            console.log(`[SYSTEM] Account for ${request.email} already exists. Marking request as ACCEPTED.`);
        }

        request.status = 'ACCEPTED';
        await request.save();
        res.json({ message: 'Registration approved!' });
    } catch (error) {
        console.error('Accept Request Internal Error:', error);
        res.status(500).json({ error: error.message || 'Failed to approve request' });
    }
});

// Reject registration request
router.post('/registration-requests/:id/reject', authenticateAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const request = await RegistrationRequest.findById(id);
        if (!request) {
            console.error(`[REJECT] Request ${id} not found`);
            return res.status(404).json({ error: 'Request not found' });
        }

        request.status = 'REJECTED';
        await request.save();
        console.log(`[REJECT] Request ${id} marked as REJECTED`);
        res.json({ message: 'Registration request declined.' });
    } catch (error) {
        console.error('Decline Request Internal Error:', error);
        res.status(500).json({ error: error.message || 'Failed to decline request' });
    }
});

// --- Student Requests Management ---

// Get all student requests (leave, etc.)
router.get('/student-requests', authenticateAdmin, async (req, res) => {
    try {
        const requests = await StudentRequest.find().populate('user', 'name studentId class').sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch student requests' });
    }
});

// Update student request status (with trigger for profile pic changes)
router.put('/student-requests/:id', authenticateAdmin, async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const request = await StudentRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        request.status = status;
        request.adminComment = adminComment;
        await request.save();

        // If approved and type is PROFILE_UPDATE, apply the change to User
        if (status === 'APPROVED' && request.type === 'PROFILE_UPDATE' && request.requestedProfilePic) {
            await User.findByIdAndUpdate(request.user, { profilePic: request.requestedProfilePic });
        }

        res.json(request);
    } catch (error) {
        console.error('Update Request Error:', error);
        res.status(500).json({ error: 'Failed to update student request' });
    }
});

// --- Routine Management ---

// Get all routines
router.get('/routines', authenticateAdmin, async (req, res) => {
    try {
        const routines = await Routine.find().sort({ class: 1, day: 1 });
        res.json(routines);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch routines' });
    }
});

// Add/Update routine
router.post('/routines', authenticateAdmin, async (req, res) => {
    try {
        const { className, day, periods } = req.body;
        let routine = await Routine.findOne({ class: className, day });
        if (routine) {
            routine.periods = periods;
            await routine.save();
        } else {
            routine = await Routine.create({ class: className, day, periods });
        }
        res.json(routine);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save routine' });
    }
});

// Delete routine
router.delete('/routines/:id', authenticateAdmin, async (req, res) => {
    try {
        await Routine.findByIdAndDelete(req.params.id);
        res.json({ message: 'Routine deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete routine' });
    }
});

// --- Fee & Subscription Management ---

// Update student fees info
router.put('/students/:id/fees', authenticateAdmin, async (req, res) => {
    try {
        const { feesAmount, feesDueDate, isFeesPaid } = req.body;
        const student = await User.findByIdAndUpdate(req.params.id, { 
            feesAmount, 
            feesDueDate, 
            isFeesPaid 
        }, { new: true });
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Block/Unblock student
router.put('/students/:id/toggle-block', authenticateAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        
        student.isBlocked = !student.isBlocked;
        if (student.isBlocked) {
            student.blockReason = reason || "Violation of school policy";
        } else {
            student.blockReason = ""; // Clear reason when unblocked
        }
        
        await student.save();
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Get All Payments
router.get('/payments', authenticateAdmin, async (req, res) => {
    try {
        const payments = await Payment.find().populate('user', 'name studentId email').sort({ paymentDate: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Update student profile picture
router.put('/students/:id/profile-pic', authenticateAdmin, async (req, res) => {
    try {
        const { profilePic } = req.body;
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        student.profilePic = profilePic;
        await student.save();
        res.json({ message: 'Profile picture updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile picture' });
    }
});

module.exports = router;
