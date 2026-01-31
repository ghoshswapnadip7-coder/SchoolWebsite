const express = require('express');
const User = require('../models/User');
const Routine = require('../models/Routine');
const ExamSheet = require('../models/ExamSheet');
const Topper = require('../models/Topper');
const Result = require('../models/Result');
const RegistrationRequest = require('../models/RegistrationRequest');
const StudentRequest = require('../models/StudentRequest');
const AdmissionSetting = require('../models/AdmissionSetting');
const Payment = require('../models/Payment');
const { sendApprovalEmail, sendResultPDFEmail } = require('../utils/email'); // Import Email Service
const { generateResultPDF } = require('../utils/pdfGenerator');
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
        let { name, email, password, studentId, className, rollNumber } = req.body;
        
        // Ensure studentId is unique
        if (studentId) {
            const existing = await User.findOne({ studentId });
            if (existing) return res.status(400).json({ error: 'Student ID already exists' });
        } else {
            // Auto-generate if not provided
            const totalStudents = await User.countDocuments({ role: 'STUDENT' });
            const totalReqs = await RegistrationRequest.countDocuments();
            studentId = `RPHS${new Date().getFullYear()}${String(totalStudents + totalReqs + 101).padStart(4, '0')}`;
        }

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
        const { userId, subject, marks, grade, semester, className } = req.body;
        const result = await Result.create({ user: userId, subject, marks, grade, semester, className });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add result' });
    }
});

// Update result
router.put('/results/:id', authenticateAdmin, async (req, res) => {
    try {
        const { subject, marks, grade, semester, className } = req.body;
        const result = await Result.findByIdAndUpdate(req.params.id, { subject, marks, grade, semester, className, isPublished: false }, { new: true });
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

// Publish Results (Send PDF)
router.post('/results/publish', authenticateAdmin, async (req, res) => {
    try {
        const { studentId, semester } = req.body;
        
        // Fetch Student
        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        
        // Validation Checks
        if (!student.email) return res.status(400).json({ error: 'Student has no email address configured.' });
        if (student.isBlocked) return res.status(400).json({ error: 'Student account is BLOCKED.' });

        // Fetch Results for that semester
        const results = await Result.find({ user: studentId, semester: semester });
        if (!results || results.length === 0) return res.status(404).json({ error: 'No results found for this semester' });

        // Update isPublished status
        await Result.updateMany({ user: studentId, semester: semester }, { isPublished: true });

        // Generate PDF
        const pdfBuffer = await generateResultPDF(student, results, semester);

        // Send Email
        const emailSent = await sendResultPDFEmail(student.email, student.name, semester, pdfBuffer);

        if (emailSent) {
            res.json({ message: 'Results published and PDF sent to student.' });
        } else {
            res.status(500).json({ error: 'Failed to send email (System Error).' });
        }
    } catch (error) {
        console.error('Publish Error:', error);
        res.status(500).json({ error: 'Failed to publish results' });
    }
});

// Get Results Dashboard Summary (Drafts vs Published)
router.get('/results/status-summary', authenticateAdmin, async (req, res) => {
    try {
        const allResults = await Result.find().populate('user', 'name studentId email isBlocked');
        console.log('Total Results found:', allResults.length);
        
        const summary = {
            totalCount: allResults.length, // Debug info
            drafts: [],
            published: [],
            errors: []
        };

        const grouped = {};
        // Group by User+Semester
        allResults.forEach(r => {
            const userId = r.user ? r.user._id : 'ORPHAN';
            const key = `${userId}|${r.semester}`;
            
            if (!grouped[key]) {
                grouped[key] = {
                    student: r.user || { name: 'Unknown (Orphaned)', studentId: '???', email: '', isBlocked: false },
                    semester: r.semester,
                    results: [],
                    isOrphan: !r.user
                };
            }
            grouped[key].results.push(r);
        });

        // Categorize
        Object.values(grouped).forEach(g => {
            // Check for errors
            const issues = [];
            if (g.isOrphan) issues.push('Orphaned Result (No Student)');
            else {
                if (!g.student.email) issues.push('No Email');
                if (g.student.isBlocked) issues.push('Blocked');
            }
            
            // Determine status (Strict boolean check)
            const allPublished = g.results.every(r => r.isPublished === true);

            // If ALREADY fully published
            if (allPublished) {
                // If there are issues, it goes to errors
                if (issues.length > 0) {
                     summary.errors.push({ ...g, issues });
                } else {
                     summary.published.push(g);
                }
            } else {
                // Drafts
                if (issues.length > 0)  {
                    summary.errors.push({ ...g, issues }); 
                } else {
                    summary.drafts.push(g);
                }
            }
        });
        
        res.header('Cache-Control', 'no-store');
        res.json(summary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

// Bulk Publish All Pending Results
router.post('/results/publish-batch', authenticateAdmin, async (req, res) => {
    try {
        // Find all unpublished results with student details
        const pendingResults = await Result.find({ isPublished: false }).populate('user');
        
        if (pendingResults.length === 0) {
            return res.json({ report: [] });
        }

        // Group by Student ID + Semester
        const groups = {};
        pendingResults.forEach(r => {
            if (!r.user) return; // Skip orphaned results
            const key = `${r.user._id}-${r.semester}`;
            if (!groups[key]) {
                groups[key] = {
                    student: r.user,
                    semester: r.semester,
                    results: []
                };
            }
            groups[key].results.push(r);
        });

        const report = [];

        for (const key in groups) {
            const { student, semester, results } = groups[key];
            let status = 'SUCCESS';
            let message = 'Published and Emailed';
            
            // Checks
            if (student.isBlocked) {
                status = 'ERROR';
                message = 'Student account is RESTRICED/BLOCKED.';
            } else if (!student.email) {
                status = 'ERROR';
                message = 'No email address found for student.';
            } else {
                // Check fail status (simple check: any subject < 30)
                const hasFailed = results.some(r => Number(r.marks) < 30); // Assuming 30 is pass mark
                
                try {
                    // Generate PDF
                    const pdfBuffer = await generateResultPDF(student, results, semester);
                    
                    // Send Email
                    const emailSent = await sendResultPDFEmail(student.email, student.name, semester, pdfBuffer);
                    
                    if (!emailSent) {
                        status = 'ERROR';
                        message = 'Email sending failed.';
                    } else {
                        // Mark as published
                        await Result.updateMany(
                            { user: student._id, semester: semester, isPublished: false }, 
                            { isPublished: true }
                        );
                        
                        if (hasFailed) {
                            status = 'WARNING';
                            message = 'Published, but student has FAILED in one or more subjects.';
                        }
                    }
                } catch (err) {
                    console.error('Batch Process Error:', err);
                    status = 'ERROR';
                    message = 'Internal processing error.';
                }
            }

            report.push({
                studentName: student.name,
                studentId: student.studentId,
                semester,
                status,
                message
            });
        }

        res.json({ report });

    } catch (error) {
        console.error('Batch Publish Error:', error);
        res.status(500).json({ error: 'Failed to run batch publish.' });
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

        // Check if student ID already exists
        const existing = await User.findOne({ studentId: request.studentId });
        
        if (!existing) {
            // High security: ensure we have a password (fallback for older requests)
            const finalPassword = request.password || await bcrypt.hash('student123', 10);

            // Assign Auto-Increment Roll Number for the specific class
            const lastStudentInClass = await User.findOne({ class: request.class }).sort({ rollNumber: -1 });
            const neRoll = lastStudentInClass && !isNaN(lastStudentInClass.rollNumber) 
                ? Number(lastStudentInClass.rollNumber) + 1 
                : 1;

            // Get admission expiry date for fee due date
            const admissionSettings = await AdmissionSetting.findOne();
            const automaticDueDate = admissionSettings?.expiryDate || new Date(new Date().getFullYear(), 11, 31);

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
                role: 'STUDENT',
                feesDueDate: automaticDueDate // Auto-set from admission expiry
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

// --- Admission Settings ---

// Get current admission settings
router.get('/admission-settings', authenticateAdmin, async (req, res) => {
    try {
        let settings = await AdmissionSetting.findOne();
        if (!settings) {
            settings = await AdmissionSetting.create({ 
                isOpen: false, 
                expiryDate: new Date(new Date().getFullYear(), 11, 31) 
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Update admission settings
router.put('/admission-settings', authenticateAdmin, async (req, res) => {
    try {
        const { isOpen, expiryDate, allowedClasses } = req.body;
        const settings = await AdmissionSetting.findOneAndUpdate(
            {}, 
            { isOpen, expiryDate, allowedClasses, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// --- Fee & Subscription Management ---

// Update student fees info
router.put('/students/:id/fees', authenticateAdmin, async (req, res) => {
    try {
        const { feesAmount, feesDueDate, isFeesPaid, paymentDate } = req.body;
        
        // Find existing student to check if we're marking them as paid
        const currentStudent = await User.findById(req.params.id);
        if (!currentStudent) return res.status(404).json({ error: 'Student not found' });

        // If newly marking as paid, record a manual transaction entry for history
        if (!currentStudent.isFeesPaid && isFeesPaid) {
            await Payment.create({
                user: req.params.id,
                amount: feesAmount || currentStudent.feesAmount || 0,
                transactionId: 'MANUAL-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                semester: 'Manual Fee Entry',
                paymentMethod: 'CASH',
                status: 'COMPLETED',
                paymentDate: paymentDate || new Date()
            });
        }

        const student = await User.findByIdAndUpdate(req.params.id, { 
            feesAmount, 
            feesDueDate, 
            isFeesPaid 
        }, { new: true });
        
        res.json(student);
    } catch (error) {
        console.error('Fees Update Error:', error);
        res.status(500).json({ error: 'Failed to update fees' });
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


// --- TOPPERS GALLERY MANAGEMENT ---

// Get all toppers
router.get('/toppers', authenticateAdmin, async (req, res) => {
    try {
        const toppers = await Topper.find().sort({ year: -1, class: 1 });
        res.json(toppers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch toppers' });
    }
});

// Add a topper
router.post('/toppers', authenticateAdmin, async (req, res) => {
    try {
        const topper = await Topper.create(req.body);
        res.status(201).json(topper);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create topper' });
    }
});

// Delete a topper
router.delete('/toppers/:id', authenticateAdmin, async (req, res) => {
    try {
        await Topper.findByIdAndDelete(req.params.id);
        res.json({ message: 'Topper deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// --- EXAM SHEET MANAGEMENT (Per Student) ---

// Upload/Add Exam Sheet link
router.post('/students/:userId/exam-sheets', authenticateAdmin, async (req, res) => {
    try {
        const { title, sheetUrl, semester, examDate } = req.body;
        const sheet = await ExamSheet.create({
            user: req.params.userId,
            title,
            sheetUrl,
            semester,
            examDate
        });
        res.status(201).json(sheet);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload sheet' });
    }
});

// Get sheets for a specific student
router.get('/students/:userId/exam-sheets', authenticateAdmin, async (req, res) => {
    try {
        const sheets = await ExamSheet.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(sheets);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Delete an exam sheet
router.delete('/exam-sheets/:id', authenticateAdmin, async (req, res) => {
    try {
        await ExamSheet.findByIdAndDelete(req.params.id);
        res.json({ message: 'Exam sheet deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Get all exam sheets across all students
router.get('/exam-sheets', authenticateAdmin, async (req, res) => {
    try {
        const sheets = await ExamSheet.find().populate('user', 'name studentId').sort({ createdAt: -1 });
        res.json(sheets);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
