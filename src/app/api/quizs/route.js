import { connectDB } from '../config/mongodb.js';
import { Question } from '../models/Question.js';

// return a list of quiz "cards" derived from existing questions.  Each card
// holds metadata about a category (e.g. programming language) and is used by
// the frontend to render the selection page.
export async function GET() {
    try {
        await connectDB();

        const stats = await Question.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    firstCreated: { $min: '$createdAt' },
                    difficulties: { $addToSet: '$difficulty' }
                }
            }
        ]);

        const categories = stats.map((c) => {
            let difficulty = 'Easy';
            if (c.difficulties.includes('Hard')) difficulty = 'Hard';
            else if (c.difficulties.includes('Medium')) difficulty = 'Medium';
            return {
                category: c._id,
                count: c.count,
                firstCreated: c.firstCreated,
                difficulty
            };
        });

        return new Response(JSON.stringify({ categories }), { status: 200 });
    } catch (error) {
        console.error('Quiz categories error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi' }), { status: 500 });
    }
}
