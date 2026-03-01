import { connectDB } from '../config/mongodb.js';
import { User } from '../models/User.js';

export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return new Response(JSON.stringify({ message: 'Foydalanuvchi IDsi kerak!' }), { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return new Response(JSON.stringify({ message: 'Foydalanuvchi topilmadi!' }), { status: 404 });
        }

        // Get all users sorted by XP for ranking
        const allUsers = await User.find().sort({ xp: -1 });
        const rank = allUsers.findIndex(u => u._id.toString() === userId) + 1;

        const dashboardData = {
            totalXp: user.xp,
            questionsSolved: user.questionsSolved,
            dayStreak: user.dayStreak,
            globalRank: rank,
            weeklyActivity: [
                { day: 'Mon', value: 150 }, { day: 'Tue', value: 250 },
                { day: 'Wed', value: 180 }, { day: 'Thu', value: 350 },
                { day: 'Fri', value: 320 }, { day: 'Sat', value: 450 },
                { day: 'Sun', value: 400 },
            ]
        }

        return new Response(JSON.stringify(dashboardData), { status: 200 });

    } catch (error) {
        console.error('Dashboard error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi yuz berdi' }), { status: 500 });
    }
}