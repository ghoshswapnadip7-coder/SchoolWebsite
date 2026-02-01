const mongoose = require('mongoose');
require('dotenv').config();

const dropIndex = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_website';
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB.');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        console.log('Attempting to drop index: email_1 from users');
        try {
            await collection.dropIndex('email_1');
            console.log('Successfully dropped index: email_1 from users');
        } catch (err) {
            if (err.codeName === 'IndexNotFound' || err.code === 27) {
                console.log('Index email_1 not found in users.');
            } else {
                console.log('Error dropping email_1 index from users:', err.message);
            }
        }

        const regCollection = db.collection('registrationrequests');
        console.log('Attempting to cleanup registrationrequests indexes...');
        
        const regIndexes = ['email_1', 'studentId_1'];
        for (const idx of regIndexes) {
            try {
                await regCollection.dropIndex(idx);
                console.log(`Successfully dropped index: ${idx} from registrationrequests`);
            } catch (err) {
                if (err.codeName === 'IndexNotFound' || err.code === 27) {
                    console.log(`Index ${idx} not found in registrationrequests.`);
                } else {
                    console.log(`Error dropping ${idx} from registrationrequests:`, err.message);
                }
            }
        }

        console.log('Verification: Remaining indexes on users collection:');
        const userIndexes = await collection.listIndexes().toArray();
        console.log(JSON.stringify(userIndexes, null, 2));

        console.log('Verification: Remaining indexes on registrationrequests collection:');
        const rIndexes = await regCollection.listIndexes().toArray();
        console.log(JSON.stringify(rIndexes, null, 2));

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Error dropping index:', error);
        process.exit(1);
    }
};

dropIndex();
