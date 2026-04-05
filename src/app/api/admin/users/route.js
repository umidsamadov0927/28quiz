import { connectDB } from '../../config/mongodb.js';
import { User } from '../../models/User.js';

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

        const { searchParams } = new URL(req.url);
        const page   = Math.max(1, parseInt(searchParams.get('page')  || '1',  10));
        const limit  = Math.max(1, parseInt(searchParams.get('limit') || '15', 10));
        const search = searchParams.get('search') || '';
        const sort   = searchParams.get('sort')   || 'xp_desc';
        const status = searchParams.get('status') || 'all';

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // ── Pre-filter pipeline (cheap ops first, then expensive $addFields) ──
        const pre = [];

        // 1. Exclude admin FIRST — reduces the set for $addFields
        pre.push({ $match: { username: { $ne: 'username' } } });

        // 2. Search filter — further shrinks the set before $addFields
        if (search.trim()) {
            pre.push({ $match: { username: { $regex: search.trim(), $options: 'i' } } });
        }

        // 3. Compute lastActive only for the filtered docs
        pre.push({ $addFields: { lastActive: { $max: '$activity.date' } } });

        // 4. Status filter (requires lastActive computed above)
        if (status === 'active') {
            pre.push({ $match: { lastActive: { $gte: sevenDaysAgo } } });
        } else if (status === 'inactive') {
            pre.push({
                $match: {
                    $or: [
                        { lastActive: { $lt: sevenDaysAgo } },
                        { lastActive: null },
                        { lastActive: { $exists: false } },
                    ],
                },
            });
        }

        // ── Sort ──
        let sortStage = { xp: -1 };
        if (sort === 'xp_asc')          sortStage = { xp: 1 };
        else if (sort === 'joined_desc') sortStage = { joinedAt: -1 };
        else if (sort === 'joined_asc')  sortStage = { joinedAt: 1 };
        else if (sort === 'questions_desc') sortStage = { questionsSolved: -1 };

        // ── Single aggregation: count + paginate via $facet ──
        const [result] = await User.aggregate([
            ...pre,
            {
                $facet: {
                    count: [{ $count: 'total' }],
                    data: [
                        { $sort: sortStage },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        { $project: { password: 0, dailyChallenges: 0, activity: 0 } },
                    ],
                },
            },
        ]);

        const users = result?.data || [];
        const total = result?.count[0]?.total || 0;

        return new Response(
            JSON.stringify({ users, total, page, limit }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Admin users error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi' }), { status: 500 });
    }
}
