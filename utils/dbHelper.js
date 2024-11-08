const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

// Save reservation data
async function saveReservation(data) {
    const db = client.db('resyBot');
    const collection = db.collection('reservations');
    await collection.insertOne(data);
}

// Save failed attempts or errors
async function logError(errorData) {
    const db = client.db('resyBot');
    const collection = db.collection('errors');
    await collection.insertOne(errorData);
}

module.exports = { connectDB, saveReservation, logError };
