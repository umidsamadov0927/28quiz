import { connectDB } from '../../config/mongodb.js';
import { User } from '../../models/User.js';
import { Question } from '../../models/Question.js';

function parseSession(cookieHeader) {
    if (!cookieHeader) return null;
    const part = cookieHeader.split(';').map(p => p.trim()).find(p => p.startsWith('session_token='));
    if (!part) return null;
    try { return JSON.parse(decodeURIComponent(part.split('=')[1] || '')); } catch { return null; }
}

export async function GET(req) {
    try {
        const cookieHeader = req.headers.get('cookie');
        const session = parseSession(cookieHeader);
        if (!session || session.username !== 'ad') {
            return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
        }

        await connectDB();

        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            totalQuestions,
            activeTodayResult,
            activeWeekResult,
            newThisWeekResult,
            xpSumResult,
            solvedSumResult,
            categoryCounts,
            difficultyRaw,
        ] = await Promise.all([
            User.countDocuments({ username: { $ne: 'ad' } }),
            Question.countDocuments(),
            User.countDocuments({
                username: { $ne: 'ad' },
                'activity.date': { $gte: todayStart },
            }),
            User.countDocuments({
                username: { $ne: 'ad' },
                'activity.date': { $gte: sevenDaysAgo },
            }),
            User.countDocuments({
                username: { $ne: 'ad' },
                joinedAt: { $gte: sevenDaysAgo },
            }),
            User.aggregate([
                { $match: { username: { $ne: 'ad' } } },
                { $group: { _id: null, total: { $sum: '$xp' } } },
            ]),
            User.aggregate([
                { $match: { username: { $ne: 'ad' } } },
                { $group: { _id: null, total: { $sum: '$questionsSolved' } } },
            ]),
            Question.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 8 },
                { $project: { _id: 0, category: '$_id', count: 1 } },
            ]),
            Question.aggregate([
                { $group: { _id: '$difficulty', count: { $sum: 1 } } },
            ]),
        ]);

        const totalXp = xpSumResult[0]?.total || 0;
        const totalSolved = solvedSumResult[0]?.total || 0;

        const difficultyDist = { Easy: 0, Medium: 0, Hard: 0 };
        for (const row of difficultyRaw) {
            if (row._id in difficultyDist) difficultyDist[row._id] = row.count;
        }

        return new Response(
            JSON.stringify({
                totalUsers,
                activeToday: activeTodayResult,
                activeThisWeek: activeWeekResult,
                newThisWeek: newThisWeekResult,
                totalQuestions,
                totalXp,
                totalSolved,
                categoryCounts,
                difficultyDist,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Admin stats error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi' }), { status: 500 });
    }
}
