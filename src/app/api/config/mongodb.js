import mongoose from 'mongoose';

const mongoUri = `mongodb+srv://umidjoon:hkx33b@28quiz.bevrzgr.mongodb.net/?appName=28quiz`;

let isConnected = false;

export async function connectDB() {
    if (isConnected) return;

    try {
        await mongoose.connect(mongoUri);
        isConnected = true;
        console.log('✓ MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

export default mongoose;
