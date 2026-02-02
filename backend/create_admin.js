const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const createAdmin = async (name, email, password) => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in .env');
            process.exit(1);
        }

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
        
        await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'ADMIN'
        });

        console.log('-----------------------------------');
        console.log('ADMIN Account Created Successfully:');
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('ROLE: ADMIN');
        console.log('-----------------------------------');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// --- CONFIGURATION ---
// Set your admin details here:
const adminName = "School Administrator";
const adminEmail = "admin@school.com";
const adminPassword = "admin-password-123";

createAdmin(adminName, adminEmail, adminPassword);
