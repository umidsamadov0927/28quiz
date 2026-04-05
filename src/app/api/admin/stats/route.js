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
        if (!session || session.username !== 'username') {
            return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
        }

        await connectDB();

        const now = new Date();
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 3 parallel calls instead of 9 — all user counts in a single $group
        const [userStats, categoryCounts, difficultyRaw] = await Promise.all([
            User.aggregate([
                { $match: { username: { $ne: 'username' } } },
                {
                    $group: {
                        _id: null,
                        totalUsers:  { $sum: 1 },
                        totalXp:     { $sum: '$xp' },
                        totalSolved: { $sum: '$questionsSolved' },
                        newThisWeek: {
                            $sum: { $cond: [{ $gte: ['$joinedAt', sevenDaysAgo] }, 1, 0] },
                        },
                        activeToday: {
                            $sum: {
                                $cond: [
                                    {
                                        $gt: [
                                            {
                                                $max: {
                                                    $filter: {
                                                        input: '$activity',
                                                        as: 'a',
                                                        cond: { $gte: ['$$a.date', todayStart] },
                                                    },
                                                },
                                            },
                                            null,
                                        ],
                                    },
                                    1, 0,
                                ],
                            },
                        },
                        activeThisWeek: {
                            $sum: {
                                $cond: [
                                    {
                                        $gt: [
                                            {
                                                $max: {
                                                    $filter: {
                                                        input: '$activity',
                                                        as: 'a',
                                                        cond: { $gte: ['$$a.date', sevenDaysAgo] },
                                                    },
                                                },
                                            },
                                            null,
                                        ],
                                    },
                                    1, 0,
                                ],
                            },
                        },
                    },
                },
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

        const s = userStats[0] || {};

        const difficultyDist = { Easy: 0, Medium: 0, Hard: 0 };
        for (const row of difficultyRaw) {
            if (row._id in difficultyDist) difficultyDist[row._id] = row.count;
        }

        // totalQuestions derived from difficultyDist sum (no extra DB call)
        const totalQuestions = Object.values(difficultyDist).reduce((a, b) => a + b, 0);

        return new Response(
            JSON.stringify({
                totalUsers:     s.totalUsers     || 0,
                activeToday:    s.activeToday    || 0,
                activeThisWeek: s.activeThisWeek || 0,
                newThisWeek:    s.newThisWeek    || 0,
                totalQuestions,
                totalXp:        s.totalXp        || 0,
                totalSolved:    s.totalSolved    || 0,
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
