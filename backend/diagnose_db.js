const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const RegistrationRequest = require('./models/RegistrationRequest');

const targetEmail = 'keuromo@gmail.com';
const targetId = 'RPHS20260103';

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- START DIAGNOSIS ---');

        const usersByEmail = await User.find({ email: targetEmail });
        console.log(`Users with email ${targetEmail}: ${usersByEmail.length}`);
        
        const usersById = await User.find({ studentId: targetId });
        console.log(`Users with studentId ${targetId}: ${usersById.length}`);
        usersById.forEach(u => console.log(` - User ID: ${u._id}, Email: ${u.email}`));

        const requestsByEmail = await RegistrationRequest.find({ email: targetEmail });
        console.log(`Requests with email ${targetEmail}: ${requestsByEmail.length}`);

        const requestsById = await RegistrationRequest.find({ studentId: targetId });
        console.log(`Requests with studentId ${targetId}: ${requestsById.length}`);
        requestsById.forEach(r => console.log(` - Request ID: ${r._id}, Email: ${r.email}, Status: ${r.status}`));

        console.log('--- END DIAGNOSIS ---');
        process.exit(0);
    } catch (err) {
        console.error('Diagnosis error:', err);
        process.exit(1);
    }
}

diagnose();
