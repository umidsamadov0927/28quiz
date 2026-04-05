import mongoose from 'mongoose';

const mongoUri = `mongodb+srv://umidjoon:hkx33b@28quiz.bevrzgr.mongodb.net/?appName=28quiz`;

// Cache connection across serverless invocations using global scope
let cached = global._mongooseCache;
if (!cached) {
    cached = global._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(mongoUri, {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 20000,
            connectTimeoutMS: 8000,
        }).then(m => m);
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        throw err;
    }

    return cached.conn;
}

export default mongoose;
