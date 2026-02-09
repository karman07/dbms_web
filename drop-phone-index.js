const mongoose = require('mongoose');

// Creating a separate script to drop the index directly
const uri = "mongodb+srv://karmanwork23_db_user:8813917626$Karman@cluster0.rf1epsi.mongodb.net/";

async function run() {
    console.log('Connecting to MongoDB...');
    try {
        await mongoose.connect(uri);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        console.log('Checking indexes...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(i => i.name));

        const phoneIndex = indexes.find(i => i.name === 'phoneNumber_1');

        if (phoneIndex) {
            console.log('Found phoneNumber_1 index. Dropping it...');
            try {
                await collection.dropIndex('phoneNumber_1');
                console.log('Successfully dropped phoneNumber_1 index.');
            } catch (err) {
                console.error('Failed to drop index:', err);
            }
        } else {
            console.log('phoneNumber_1 index not found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

run();
