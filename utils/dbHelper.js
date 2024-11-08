const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

async function saveReservation(data) {
    const db = client.db('resyBot');
    const collection = db.collection('reservations');
    await collection.insertOne(data);
}

module.exports = { connectDB, saveReservation };
