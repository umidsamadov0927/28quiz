import { connectDB } from '../config/mongodb.js';
import { User } from '../models/User.js';

function parseSession(cookieHeader) {
    if (!cookieHeader) return null;
    const part = cookieHeader.split(';').map(p => p.trim()).find(p => p.startsWith('session_token='));
    if (!part) return null;
    try { return JSON.parse(decodeURIComponent(part.split('=')[1] || '')); } catch { return null; }
}

// Usernames hidden from public leaderboard (admin accounts)
const HIDDEN_USERS = ['ad'];

export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page  = Math.max(1, parseInt(searchParams.get('page')  || '1'));
        const limit = Math.max(1, parseInt(searchParams.get('limit') || '10'));
        const skip  = (page - 1) * limit;

        const session = parseSession(req.headers.get('cookie'));

        // Base filter: exclude admin accounts
        const baseFilter = { username: { $nin: HIDDEN_USERS } };

        const [users, total] = await Promise.all([
            User.find(baseFilter)
                .select('-password -activity -dailyXpDate')
                .sort({ xp: -1, joinedAt: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(baseFilter),
        ]);

        // Compute current user's rank (exclude hidden users from count too)
        let myRank = null;
        if (session?.username && !HIDDEN_USERS.includes(session.username)) {
            const me = await User.findOne({ username: session.username }).select('xp joinedAt').lean();
            if (me) {
                const xp = me.xp ?? 0;
                const [above, tiedBefore] = await Promise.all([
                    User.countDocuments({ ...baseFilter, xp: { $gt: xp } }),
                    User.countDocuments({ ...baseFilter, xp, joinedAt: { $lt: me.joinedAt } }),
                ]);
                myRank = above + tiedBefore + 1;
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
