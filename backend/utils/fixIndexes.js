const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const dropEmailIndex = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const collection = mongoose.connection.collection('registrationrequests');
        
        console.log('Checking indexes on registrationrequests...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        const dropIfExist = async (idxName) => {
            const hasIndex = indexes.some(idx => idx.name === idxName);
            if (hasIndex) {
                console.log(`Dropping unique index: ${idxName}`);
                await collection.dropIndex(idxName);
                console.log(`Index ${idxName} dropped successfully.`);
            } else {
                console.log(`Index "${idxName}" not found. Nothing to drop.`);
            }
        };

        await dropIfExist('email_1');
        await dropIfExist('studentId_1');

        // Close connection
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    } catch (error) {
        console.error('Error dropping index:', error);
        process.exit(1);
    }
};

dropEmailIndex();
