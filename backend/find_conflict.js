const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const RegistrationRequest = require('./models/RegistrationRequest');

async function findConflict() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'keuromo@gmail.com';
        const sid = 'RPHS20260103';

        console.log('SEARCHING FOR EMAIL:', email);
        const usersEmail = await User.find({ email });
        console.log('Users:', usersEmail.length);
        const reqsEmail = await RegistrationRequest.find({ email });
        console.log('Requests:', reqsEmail.length);

        console.log('SEARCHING FOR STUDENT ID:', sid);
        const usersId = await User.find({ studentId: sid });
        console.log('Users:', usersId.length);
        usersId.forEach(u => console.log(`  - User: ${u.name}, Email: ${u.email}`));
        
        const reqsId = await RegistrationRequest.find({ studentId: sid });
        console.log('Requests:', reqsId.length);
        reqsId.forEach(r => console.log(`  - Req: ${r.name}, Email: ${r.email}, Status: ${r.status}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
findConflict();
