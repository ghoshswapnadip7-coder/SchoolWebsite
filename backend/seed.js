const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Result = require('./models/Result');
const Routine = require('./models/Routine');
const Event = require('./models/Event');
const GalleryItem = require('./models/GalleryItem');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Result.deleteMany({});
        await Routine.deleteMany({});
        await Event.deleteMany({});
        await GalleryItem.deleteMany({});

        // Create Users
        const hashedPassword = await bcrypt.hash('student123', 10);
        const student1 = await User.create({
            name: 'John Doe',
            email: 'student@school.com',
            password: hashedPassword,
            studentId: 'STU2025001',
            role: 'STUDENT'
        });
        const student2 = await User.create({
            name: 'Jane Smith',
            email: 'jane@school.com',
            password: hashedPassword,
            studentId: 'STU2025002',
            role: 'STUDENT'
        });
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@school.com',
            password: hashedPassword,
            role: 'ADMIN'
        });
        console.log('Test Accounts Created:');
        console.log('- student@school.com / student123 (Student)');
        console.log('- jane@school.com / student123 (Student)');
        console.log('- admin@school.com / student123 (Admin)');

        // Create Results for Student 1
        await Result.insertMany([
            { user: student1._id, subject: 'Mathematics', marks: 85, grade: 'A', semester: 'Final Exam 2025' },
            { user: student1._id, subject: 'Science', marks: 78, grade: 'B+', semester: 'Final Exam 2025' },
            { user: student1._id, subject: 'English', marks: 92, grade: 'A+', semester: 'Final Exam 2025' },
            { user: student1._id, subject: 'History', marks: 88, grade: 'A', semester: 'Final Exam 2025' }
        ]);

        // Create Results for Student 2
        await Result.insertMany([
            { user: student2._id, subject: 'Mathematics', marks: 95, grade: 'O', semester: 'Final Exam 2025' },
            { user: student2._id, subject: 'Science', marks: 92, grade: 'A+', semester: 'Final Exam 2025' }
        ]);

        // Create Routine for Class 10
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const subjects = ['Math', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
        const teachers = ['Mr. Smith', 'Dr. Brown', 'Mrs. Davis', 'Mr. Wilson', 'Ms. Garcia'];

        for (const day of days) {
            await Routine.create({
                class: 'Class-10',
                day: day,
                periods: [
                    { subject: subjects[Math.floor(Math.random() * subjects.length)], teacher: teachers[0], startTime: '09:00 AM', endTime: '10:00 AM', room: 'Room 101' },
                    { subject: subjects[Math.floor(Math.random() * subjects.length)], teacher: teachers[1], startTime: '10:15 AM', endTime: '11:15 AM', room: 'Lab A' },
                    { subject: 'Break', teacher: '-', startTime: '11:15 AM', endTime: '11:45 AM', room: 'Canteen' },
                    { subject: subjects[Math.floor(Math.random() * subjects.length)], teacher: teachers[2], startTime: '11:45 AM', endTime: '12:45 PM', room: 'Room 101' }
                ]
            });
        }

        // Create Events
        await Event.insertMany([
            {
                title: 'Annual Sports Day',
                description: 'Join us for a day of athletic competitions and fun activities.',
                date: new Date('2025-03-20'),
                location: 'School Ground',
                imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800'
            },
            {
                title: 'Science Fair 2025',
                description: 'Students from all classes will showcase their innovative projects.',
                date: new Date('2025-04-10'),
                location: 'Science Block',
                imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800'
            },
            {
                title: 'Mathematics Final Exam',
                description: 'Final examination for the academic session 2024-25.',
                date: new Date('2025-06-15'),
                location: 'Main Hall',
                imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800'
            },
            {
                title: 'English Literacy Week',
                description: 'A week dedicated to poems, debates, and literature.',
                date: new Date('2025-05-05'),
                location: 'Library Hall',
                imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800'
            }
        ]);

        // Create Gallery Items
        await GalleryItem.insertMany([
            {
                title: 'School Building',
                imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800',
                description: 'The main entrance of our beautiful school campus.',
                category: 'Campus'
            },
            {
                title: 'Chemistry Lab',
                imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
                description: 'Our state-of-the-art laboratory for scientific experiments.',
                category: 'Facilities'
            },
            {
                title: 'Annual Day Performance',
                imageUrl: 'https://images.unsplash.com/photo-1514525253344-f814d871d345?auto=format&fit=crop&q=80&w=800',
                description: 'Students performing a traditional dance on Annual Day.',
                category: 'Events'
            },
            {
                title: 'Sports Field',
                imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800',
                description: 'Our large playground where students stay active.',
                category: 'Campus'
            },
            {
                title: 'Computer Lab',
                imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
                description: 'Modern computing facilities for digital learning.',
                category: 'Facilities'
            }
        ]);

        console.log('Seeding Complete! Successfully populated Users, Results, Routines, Events, and Gallery.');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
