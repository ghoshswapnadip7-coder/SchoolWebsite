const express = require('express');
const User = require('../models/User');
const Result = require('../models/Result');
const Notice = require('../models/Notice');
const jwt = require('jsonwebtoken');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-prod';

// Middleware to check Teacher auth
// Middleware to check Teacher auth
const authenticateTeacher = (req, res, next) => {
    // Prioritize Header token (Client sends this explicitly)
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    
    if (!token) {
        // console.log("Auth Failed: No token provided");
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // Allow if role is TEACHER or ADMIN (Admin might want to debug)
        if (decoded.role !== 'TEACHER' && decoded.role !== 'ADMIN') {
            // console.log("Auth Failed: Role mismatch", decoded.role);
            return res.status(403).json({ error: 'Access denied. Teachers only.' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        // console.log("Auth Failed: Token verification error", err.message);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// --- Profile Management ---

// Get my profile
router.get('/profile', authenticateTeacher, async (req, res) => {
    try {
        const teacher = await User.findById(req.user.userId).select('-password');
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update my profile (Bio, Social, Gallery)
router.put('/profile', authenticateTeacher, async (req, res) => {
    try {
        const { bio, socialLinks, gallery, achievements, profilePic, vlogs, blogs, coverImage } = req.body;
        
        // Find and update
        const teacher = await User.findByIdAndUpdate(
            req.user.userId,
            { bio, socialLinks, gallery, achievements, profilePic, vlogs, blogs, coverImage },
            { new: true }
        ).select('-password');
        
        res.json(teacher);
    } catch (error) {
        // console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// --- Student Management ---

// Get my students (Filtered by class if provided)
router.get('/students', authenticateTeacher, async (req, res) => {
    try {
        const { className } = req.query;
        let query = { role: 'STUDENT' };
        if (className && className !== 'All') {
            query.class = className;
        }

        const students = await User.find(query)
            .select('name studentId class rollNumber email profilePic')
            .sort({ class: 1, rollNumber: 1 });
            
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// --- Marks Entry ---

// Add/Update Marks (Always saved as PENDING until Admin approval)
router.post('/marks', authenticateTeacher, async (req, res) => {
    try {
        const { userId, subject, marks, projectMarks, grade, semester, className } = req.body;
        
        // Basic Validation
        if (!userId || !subject || marks === undefined || !grade || !semester || !className) {
            return res.status(400).json({ error: 'Missing required fields for marks entry' });
        }

        const teacherId = req.user.userId;
        const theoryMarks = Number(marks);
        const project = Number(projectMarks || 0);

        // --- SPECIFIC CRITERIA VALIDATION ---
        const classLevel = parseInt(className.match(/\d+/)?.[0] || 0);
        
        if (classLevel >= 5 && classLevel <= 10) {
            // Rule: 90 Theory + 10 Project = 100 Total
            if (theoryMarks > 90) return res.status(400).json({ error: 'Theory marks for Classes 5-10 cannot exceed 90.' });
            if (project > 10) return res.status(400).json({ error: 'Project marks for Classes 5-10 cannot exceed 10.' });
        } else if (classLevel === 11 || classLevel === 12) {
            // Rule: Usually 80 Theory + 20 Project or 70 Theory + 30 Practical
            // We'll allow up to 80 Theory and 30 Project for flexibility in labs
            if (theoryMarks > 80) return res.status(400).json({ error: 'Theory marks for Classes 11-12 cannot exceed 80.' });
            if (project > 30) return res.status(400).json({ error: 'Project/Practical marks for Classes 11-12 cannot exceed 30.' });
        }

        // Check if result exists for this student + subject + semester
        let result = await Result.findOne({ user: userId, subject, semester });
        
        const marksData = {
            user: userId,
            subject,
            marks: theoryMarks,
            projectMarks: project,
            grade,
            semester,
            className,
            teacher: teacherId, // Track who entered it
            isPublished: false  // ALWAYS set to false, needs admin approval to be published
        };

        if (result) {
            // Update existing entry
            result = await Result.findByIdAndUpdate(result._id, marksData, { new: true });
            // console.log(`[DEBUG] Updated marks for student ${userId}: ${subject}`);
        } else {
            // Create new entry
            result = await Result.create(marksData);
            // console.log(`[DEBUG] Created new marks for student ${userId}: ${subject}`);
        }
        
        res.status(200).json(result);
    } catch (error) {
        console.error('CRITICAL: Marks Entry Error:', error); // Probably keep this as it is error logging
        res.status(500).json({ 
            error: 'Failed to save marks', 
            details: error.message
        });
    }
});

// Get My Uploaded Marks History
router.get('/marks-history', authenticateTeacher, async (req, res) => {
    try {
        const history = await Result.find({ teacher: req.user.userId })
            .populate('user', 'name studentId')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch marks history' });
    }
});

// Get Results Summary for Teacher's Current View
router.get('/results-summary', authenticateTeacher, async (req, res) => {
    try {
        const { className, semester, subject } = req.query;
        if (!className || !semester || !subject) {
            return res.status(400).json({ error: 'Missing filters' });
        }

        const query = { className, semester, subject };
        if (className === 'All') delete query.className;

        const results = await Result.find(query).populate('user', 'studentId name');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch results summary' });
    }
});

// --- Notices ---

// Get Notices (Authority notices + My sent notices)
router.get('/notices', authenticateTeacher, async (req, res) => {
    try {
        const teacherId = req.user.userId;
        
        // Find notices targeted at teachers OR posted by this teacher
        const notices = await Notice.find({
            $or: [
                { targetType: 'TEACHER', status: 'PUBLISHED' },
                { author: teacherId }
            ]
        }).sort({ createdAt: -1 });
        
        res.json(notices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notices' });
    }
});

// Post a Notice (Requires Admin Approval)
router.post('/notices', authenticateTeacher, async (req, res) => {
    try {
        const { title, content, targetType, targetId, attachments } = req.body;
        
        const notice = await Notice.create({
            title,
            content,
            targetType,
            targetId: targetType === 'STUDENT' ? targetId?.toUpperCase() : targetId,
            attachments: attachments || [],
            author: req.user.userId,
            status: 'PENDING' // Teachers' notices are ALWAYS pending approval
        });
        
        res.status(201).json(notice);
    } catch (error) {
        // console.error('Teacher Notice Error:', error);
        res.status(500).json({ error: 'Failed to submit notice for approval' });
    }
});

module.exports = router;
