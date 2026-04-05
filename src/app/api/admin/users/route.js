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
        if (!session || session.username !== 'ad') {
            return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.max(1, parseInt(searchParams.get('limit') || '15', 10));
        const search = searchParams.get('search') || '';
        const sort = searchParams.get('sort') || 'xp_desc';
        const status = searchParams.get('status') || 'all';

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Build aggregation pipeline
        const pipeline = [];

        // Step 1: Compute lastActive from activity array
        pipeline.push({
            $addFields: {
                lastActive: { $max: '$activity.date' },
            },
        });

        // Step 2: Exclude admin
        pipeline.push({ $match: { username: { $ne: 'ad' } } });

        // Step 3: Search filter
        if (search.trim()) {
            pipeline.push({
                $match: { username: { $regex: search.trim(), $options: 'i' } },
            });
        }

        // Step 4: Status filter
        if (status === 'active') {
            pipeline.push({
                $match: { lastActive: { $gte: sevenDaysAgo } },
            });
        } else if (status === 'inactive') {
            pipeline.push({
                $match: {
                    $or: [
                        { lastActive: { $lt: sevenDaysAgo } },
                        { lastActive: null },
                        { lastActive: { $exists: false } },
                    ],
                },
            });
        }

        // Step 5: Sort
        let sortStage = {};
        switch (sort) {
            case 'xp_asc':
                sortStage = { xp: 1 };
                break;
            case 'joined_desc':
                sortStage = { joinedAt: -1 };
                break;
            case 'joined_asc':
                sortStage = { joinedAt: 1 };
                break;
            case 'questions_desc':
                sortStage = { questionsSolved: -1 };
                break;
            case 'xp_desc':
            default:
                sortStage = { xp: -1 };
                break;
        }
        pipeline.push({ $sort: sortStage });

        // Step 6: Count total (facet)
        const countPipeline = [...pipeline, { $count: 'total' }];

        // Step 7: Pagination
        pipeline.push({ $skip: (page - 1) * limit });
        pipeline.push({ $limit: limit });

        // Step 8: Project (exclude sensitive/large fields)
        pipeline.push({
            $project: {
                password: 0,
                dailyChallenges: 0,
                activity: 0,
            },
        });

        const [users, countResult] = await Promise.all([
            User.aggregate(pipeline),
            User.aggregate(countPipeline),
        ]);

        const total = countResult[0]?.total || 0;

        return new Response(
            JSON.stringify({ users, total, page, limit }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Admin users error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi' }), { status: 500 });
    }
}
