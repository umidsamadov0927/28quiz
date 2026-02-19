import { promises as fs } from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return new Response(JSON.stringify({ message: 'Foydalanuvchi IDsi kerak!' }), { status: 400 });
        }

        const data = await fs.readFile(usersFilePath, 'utf-8');
        const users = JSON.parse(data);
        const user = users.find(u => u.id === userId);  

        if (!user) {
            return new Response(JSON.stringify({ message: 'Foydalanuvchi topilmadi!' }), { status: 404 });
        }


        const sortedUsers = users.sort((a, b) => b.xp - a.xp);
        const rank = sortedUsers.findIndex(u => u.id === userId) + 1;
        const dashboardData = {
            totalXp: user.xp,
            quesstionsSolved: user.questionsSolved,
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
        console.error(error);
        return new Response(JSON.stringify({ message: 'Server xatosi yuz berdi' }), { status: 500 });
    }
}