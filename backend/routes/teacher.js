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
            console.log("Auth Failed: Role mismatch", decoded.role);
            return res.status(403).json({ error: 'Access denied. Teachers only.' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        console.log("Auth Failed: Token verification error", err.message);
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
        console.error('Update Profile Error:', error);
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

// Add/Update Marks
router.post('/marks', authenticateTeacher, async (req, res) => {
    try {
        const { userId, subject, marks, projectMarks, grade, semester, className } = req.body;
        
        // Check if result exists
        let result = await Result.findOne({ user: userId, subject, semester });
        
        if (result) {
            // Update
            result.marks = marks;
            result.projectMarks = projectMarks;
            result.grade = grade;
            result.className = className; // Update class in case it changed
            result.isPublished = false; // Reset to unpublished on edit
            await result.save();
        } else {
            // Create
            result = await Result.create({
                user: userId,
                subject,
                marks,
                projectMarks: projectMarks || 0,
                grade,
                semester,
                className,
                isPublished: false
            });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error('Marks Entry Error:', error);
        res.status(500).json({ error: 'Failed to save marks' });
    }
});

// --- Notices ---

// Post a Notice
router.post('/notices', authenticateTeacher, async (req, res) => {
    try {
        const { title, content, targetType, targetId, attachments } = req.body;
        
        // Teachers can post to ALL (Public), CLASS, or STUDENT
        const notice = await Notice.create({
            title,
            content,
            targetType,
            targetId,
            attachments,
            postedBy: req.user.userId, // Track who posted
            status: 'PUBLISHED' // Auto-publish for teachers for now
        });
        
        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({ error: 'Failed to post notice' });
    }
});

module.exports = router;
