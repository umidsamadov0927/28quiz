import { connectDB } from '../config/mongodb.js';
import { Question } from '../models/Question.js';

export async function GET() {
    try {
        await connectDB();

        const stats = await Question.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    firstCreated: { $min: '$createdAt' },
                    difficulties: { $push: '$difficulty' },
                    totalXp: { $sum: '$xpReward' },
                }
            }
        ]);

        const categories = stats.map((c) => {
            const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
            (c.difficulties || []).forEach(d => { if (d in diffCounts) diffCounts[d]++; });

            let difficulty = 'Easy';
            if (diffCounts.Hard > 0) difficulty = 'Hard';
            else if (diffCounts.Medium > 0) difficulty = 'Medium';

            return {
                category: c._id,
                count: c.count,
                firstCreated: c.firstCreated,
                difficulty,
                diffCounts,
                totalXp: c.totalXp || 0,
            };
        });

        return new Response(JSON.stringify({ categories }), { status: 200 });
    } catch (error) {
        console.error('Quiz categories error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi' }), { status: 500 });
    }
}
