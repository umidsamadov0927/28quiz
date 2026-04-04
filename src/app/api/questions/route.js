import { connectDB } from '../config/mongodb.js';
import { Question } from '../models/Question.js';

// only admin users may create questions; we check username === 'ad' as before.
function parseSessionFromCookie(cookieHeader) {
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(';').map(p => p.trim());
    const tokenPart = parts.find(p => p.startsWith('session_token='));
    if (!tokenPart) return null;
    let raw = tokenPart.split('=')[1] || '';
    try {
        raw = decodeURIComponent(raw);
        return JSON.parse(raw);
    } catch (e) {
        try { return JSON.parse(raw); } catch { return null; }
    }
}

export async function POST(req) {
    try {
        await connectDB();

        const cookie = req.headers.get('cookie');
        const session = parseSessionFromCookie(cookie);
        if (!session || session.username !== 'ad') {
            return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
        }

        const { category, difficulty, question, options, correctAnswer, xpReward, time } = await req.json();
        if (!category || !question || options == null || correctAnswer == null) {
            return new Response(JSON.stringify({ message: 'Missing fields' }), { status: 400 });
        }

        const existingCount = await Question.countDocuments({ category });
        if (existingCount >= 31) {
            return new Response(JSON.stringify({ message: 'Category already has maximum tests' }), { status: 400 });
        }

        const doc = await Question.create({ category, difficulty, question, options, correctAnswer, xpReward, time });
        return new Response(JSON.stringify({ question: doc }), { status: 201 });
    } catch (error) {
        console.error('Create question error:', error);
        return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
    }
}
