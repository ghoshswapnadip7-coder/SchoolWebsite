const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const createTeacher = async (name, email, password, designation = 'Arts') => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`User with email ${email} already exists.`);
            await mongoose.connection.close();
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newTeacher = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'TEACHER',
            designation,
            subjects: ['General'],
            bio: 'A newly created teacher account.'
        });

        console.log('-----------------------------------');
        console.log('Teacher Account Created Successfully:');
        console.log(`Name: ${newTeacher.name}`);
        console.log(`Email: ${newTeacher.email}`);
        console.log(`Password: ${password} (stored hashed)`);
        console.log(`Designation: ${newTeacher.designation}`);
        console.log('-----------------------------------');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// CHANGE THESE VALUES TO CREATE A NEW USER
const name = "Trishan Debnath";
const email = "tst@gmail.com";
const password = "password123";
const designation = "HM"; // Options: HM, Assistant HM, Clerk, Para teacher, Arts, Science

createTeacher(name, email, password, designation);
