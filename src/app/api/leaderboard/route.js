import { connectDB } from '../config/mongodb.js';
import { User } from '../models/User.js';

function parseSession(cookieHeader) {
    if (!cookieHeader) return null;
    const part = cookieHeader.split(';').map(p => p.trim()).find(p => p.startsWith('session_token='));
    if (!part) return null;
    try { return JSON.parse(decodeURIComponent(part.split('=')[1] || '')); } catch { return null; }
}

export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page  = Math.max(1, parseInt(searchParams.get('page')  || '1'));
        const limit = Math.max(1, parseInt(searchParams.get('limit') || '10'));
        const skip  = (page - 1) * limit;

        const session = parseSession(req.headers.get('cookie'));

        const [users, total] = await Promise.all([
            User.find()
                .select('-password -activity -dailyXpDate')
                .sort({ xp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(),
        ]);

        // Compute current user's rank
        let myRank = null;
        if (session?.username) {
            const me = await User.findOne({ username: session.username }).select('xp').lean();
            if (me) {
                myRank = await User.countDocuments({ xp: { $gt: me.xp || 0 } }) + 1;
            }
        }

        return new Response(
            JSON.stringify({ leaderboard: users, total, page, limit, myRank }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Leaderboard error:', error);
        return new Response(JSON.stringify({ message: 'Leaderboard olishda xato' }), { status: 500 });
    }
}
