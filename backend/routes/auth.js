const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RegistrationRequest = require('../models/RegistrationRequest');
const AdmissionSetting = require('../models/AdmissionSetting');
const Result = require('../models/Result');

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
        
        if (!applicationType) {
            return res.status(400).json({ error: 'Application type is required' });
        }

        // Remove email uniqueness checks as per user request (siblings can share parent email)
        
        if (applicationType === 'PROMOTION') {
            if (!previousStudentId) return res.status(400).json({ error: 'Student ID is required for promotion' });
            
            const existingStudent = await User.findOne({ studentId: previousStudentId.toUpperCase(), role: 'STUDENT' });
            if (!existingStudent) return res.status(404).json({ error: 'Student not found with this ID' });

            // Auto-fill from existing record
            const studentName = existingStudent.name;
            const studentEmail = existingStudent.email;
            const studentPassword = existingStudent.password; // Keep existing hashed password

            // Class Level Validation
            const getClassLevel = (className) => {
                const match = className.match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
            };

            const currentLevel = getClassLevel(existingStudent.class || 'Class-0');
            const targetLevel = getClassLevel(className);

            if (targetLevel < currentLevel) {
                return res.status(400).json({ 
                    error: 'Invalid Promotion', 
                    message: `You cannot apply for a class (${className}) lower than your current class (${existingStudent.class}).` 
                });
            }

            // --- PROMOTION ELIGIBILITY CHECK ---
            // If the student is applying for a higher class, they MUST have passed all subjects in their current class.
            if (targetLevel > currentLevel) {
                // 1. Fetch current class results
                 const currentResults = await Result.find({ 
                    user: existingStudent._id, 
                    className: existingStudent.class 
                });

                // 2. PRIORITY CHECK: Any Failures?
                const isFailSubject = (r) => (Number(r.marks) + Number(r.projectMarks || 0)) < 30;
                const isSenior = ['Class-11', 'Class-12'].includes(existingStudent.class);
                let isFail = false;
                let failedSubjectsDetails = [];

                if (isSenior) {
                    const compulsory = currentResults.filter(r => /^(ben|eng|bengali|english)/i.test(r.subject));
                    const electives = currentResults.filter(r => !/^(ben|eng|bengali|english)/i.test(r.subject));

                    const failedCompulsory = compulsory.filter(isFailSubject);
                    const failedElectives = electives.filter(isFailSubject);

                    if (failedCompulsory.length > 0) {
                        isFail = true;
                        failedSubjectsDetails = [...failedSubjectsDetails, ...failedCompulsory];
                    }
                    if (failedElectives.length >= 2) {
                        isFail = true;
                        failedSubjectsDetails = [...failedSubjectsDetails, ...failedElectives];
                    }
                } else {
                    const failed = currentResults.filter(isFailSubject);
                    if (failed.length > 0) {
                        isFail = true;
                        failedSubjectsDetails = failed;
                    }
                }

                if (isFail) {
                    return res.status(403).json({ 
                        error: 'Promotion Ineligible', 
                        message: `You cannot apply for promotion/re-admission because you have failed in one or more subjects (${failedSubjectsDetails.map(f => f.subject).join(', ')}) in ${existingStudent.class}. Please contact the Head of Institution (HOI) for further guidance.` 
                    });
                }

                // 3. SECONDARY CHECK: Completeness
                const resultSubjects = currentResults.map(r => r.subject);
                const missingSubjects = (existingStudent.subjects && existingStudent.subjects.length > 0) 
                    ? existingStudent.subjects.filter(s => !resultSubjects.includes(s))
                    : [];
                
                if (missingSubjects.length > 0) {
                    return res.status(403).json({ 
                        error: 'Promotion Ineligible', 
                        message: `You cannot apply for promotion because your marksheet for ${existingStudent.class} is incomplete. Missing subjects: ${missingSubjects.join(', ')}. Please contact the administrative office/HOI.` 
                    });
                }
            }

            // --- CLASS 12 RESTRICTION CHECK ---
            // Students promoting from Class 11 to 12 CANNOT change their subjects/stream.
            if (className === 'Class-12' && existingStudent.class === 'Class-11') {
                if (existingStudent.stream !== stream) {
                    return res.status(400).json({ error: 'Invalid Stream', message: 'You cannot change your stream when promoting to Class 12.' });
                }
                
                // Compare subjects (ensure arrays have same content)
                const subjectsMatch = subjects.length === existingStudent.subjects.length && 
                    subjects.every(s => existingStudent.subjects.includes(s));
                
                if (!subjectsMatch) {
                    return res.status(400).json({ error: 'Invalid Subject Selection', message: 'You cannot change your subjects when promoting to Class 12. Proceed with Class 11 subjects.' });
                }
            }
            // --- END ELIGIBILITY CHECK ---

            // Validation for Class 11/12
            const isSeniorSecondary = ['Class-11', 'Class-12'].includes(className);
            if (isSeniorSecondary && (!stream || !subjects || subjects.length === 0)) {
                return res.status(400).json({ error: 'Stream and Subjects are required for Class 11 and 12' });
            }

            // Check for pending requests
            const existingRequest = await RegistrationRequest.findOne({ studentId: previousStudentId.toUpperCase(), status: 'PENDING' });
            if (existingRequest) return res.status(400).json({ error: 'A promotion request is already pending for this ID' });

            const request = await RegistrationRequest.create({
                name: studentName,
                email: studentEmail,
                studentId: previousStudentId.toUpperCase(),
                class: className,
                rollNumber: rollNumber || 'TBD',
                stream,
                subjects,
                applicationType,
                previousStudentId,
                password: studentPassword,
                status: 'PENDING'
            });

            return res.status(201).json({ 
                message: 'Promotion request received!', 
                studentId: request.studentId 
            });
        }

        // FRESH Application Logic
        if (!name || !email || !className || !rollNumber || !password) {
            return res.status(400).json({ error: 'Core fields including password are required' });
        }

        if (!documents || !documents.aadharCard || !documents.pastMarksheet) {
            return res.status(400).json({ error: 'Fresh admissions require Aadhar and Marksheet (Images/PDFs)' });
        }

        const currentYear = new Date().getFullYear();
        let totalRecords = await User.countDocuments({ role: 'STUDENT' }) + await RegistrationRequest.countDocuments();
        let studentIdToUse = '';
        let isUnique = false;
        let offset = 101;

        while (!isUnique) {
            studentIdToUse = `RPHS${currentYear}${String(totalRecords + offset).padStart(4, '0')}`;
            const existsInUsers = await User.findOne({ studentId: studentIdToUse });
            const existsInReqs = await RegistrationRequest.findOne({ studentId: studentIdToUse });
            
            if (!existsInUsers && !existsInReqs) {
                isUnique = true;
            } else {
                totalRecords++; // Increment and try next
            }
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
            applicationType: 'FRESH',
            documents,
            password: hashedPassword,
            plainPassword: password
        });

        res.status(201).json({ 
            message: 'Fresh admission application submitted!', 
            studentId: request.studentId 
        });
    } catch (error) {
        // console.error(error);
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

        // Security: Prevent creating ADMIN accounts via API
        if (role === 'ADMIN') {
            return res.status(403).json({ error: 'Admin accounts can only be created via the system console for security reasons.' });
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

// Check Promotion Eligibility (Public helper for UI)
router.get('/check-eligibility/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId.toUpperCase();
        const student = await User.findOne({ studentId, role: 'STUDENT' });
        
        if (!student) return res.status(404).json({ error: 'Student not found with this ID' });

        // Fetch current class results
        const currentResults = await Result.find({ user: student._id, className: student.class });

        // 1. PRIORITY CHECK: Any Failures?
        const isFailSubject = (r) => (Number(r.marks) + Number(r.projectMarks || 0)) < 30;
        const isSenior = ['Class-11', 'Class-12'].includes(student.class);
        let isFail = false;
        let failedSubjectsDetails = [];

        if (isSenior) {
            const compulsory = currentResults.filter(r => /^(ben|eng|bengali|english)/i.test(r.subject));
            const electives = currentResults.filter(r => !/^(ben|eng|bengali|english)/i.test(r.subject));

            const failedCompulsory = compulsory.filter(isFailSubject);
            const failedElectives = electives.filter(isFailSubject);

            if (failedCompulsory.length > 0) {
                isFail = true;
                failedSubjectsDetails = [...failedSubjectsDetails, ...failedCompulsory];
            }
            if (failedElectives.length >= 2) {
                isFail = true;
                failedSubjectsDetails = [...failedSubjectsDetails, ...failedElectives];
            }
        } else {
            const failed = currentResults.filter(isFailSubject);
            if (failed.length > 0) {
                isFail = true;
                failedSubjectsDetails = failed;
            }
        }
        
        if (isFail) {
            return res.status(403).json({ 
                eligible: false,
                reason: 'FAILED_SUBJECTS',
                message: `You have failed in: ${failedSubjectsDetails.map(f => f.subject).join(', ')} in your previous class (${student.class}).`,
                details: 'Contact the Head of Institution (HOI) for further guidance.'
            });
        }
        
        // 2. SECONDARY CHECK: Completeness
        // Only check for missing subjects if they haven't failed any existing ones.
        const resultSubjects = currentResults.map(r => r.subject);
        const missingSubjects = (student.subjects && student.subjects.length > 0) 
            ? student.subjects.filter(s => !resultSubjects.includes(s))
            : [];
        
        if (missingSubjects.length > 0) {
            return res.status(403).json({ 
                eligible: false,
                reason: 'INCOMPLETE_MARKSHEET',
                message: `Your marksheet for ${student.class} is incomplete. Missing: ${missingSubjects.join(', ')}.`,
                details: 'Please contact administration.'
            });
        }

        res.json({ 
            eligible: true, 
            studentName: student.name, 
            currentClass: student.class,
            stream: student.stream,     // Pass stream for pre-filling
            subjects: student.subjects  // Pass subjects for pre-filling/restriction
        });
    } catch (error) {
        console.error('Check eligibility error:', error);
        res.status(500).json({ error: 'Check failed' });
    }
});

module.exports = router;
