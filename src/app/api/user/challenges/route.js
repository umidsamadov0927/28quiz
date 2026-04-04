import { connectDB } from '../../config/mongodb.js';
import { User } from '../../models/User.js';

function parseSessionFromCookie(cookieHeader) {
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(';').map(p => p.trim());
    const tokenPart = parts.find(p => p.startsWith('session_token='));
    if (!tokenPart) return null;
    let raw = tokenPart.split('=')[1] || '';
    try { raw = decodeURIComponent(raw); return JSON.parse(raw); }
    catch { try { return JSON.parse(raw); } catch { return null; } }
}

const POOL = [
    { id: 'c1',  title: "Boshlang'ich",    description: "3 ta savol yech",           type: 'solve',   target: 3,   xpReward: 15 },
    { id: 'c2',  title: "Faol O'quvchi",   description: "5 ta savol yech",           type: 'solve',   target: 5,   xpReward: 25 },
    { id: 'c3',  title: "Quiz Ustasi",     description: "10 ta savol yech",          type: 'solve',   target: 10,  xpReward: 50 },
    { id: 'c4',  title: "To'g'ri Yo'l",    description: "3 ta to'g'ri javob ber",   type: 'correct', target: 3,   xpReward: 20 },
    { id: 'c5',  title: "Aniq Nishon",     description: "5 ta to'g'ri javob ber",   type: 'correct', target: 5,   xpReward: 35 },
    { id: 'c6',  title: "Bilimdon",        description: "10 ta to'g'ri javob ber",  type: 'correct', target: 10,  xpReward: 60 },
    { id: 'c7',  title: "XP Yig'uvchi",    description: "30 XP to'pla",              type: 'xp',      target: 30,  xpReward: 20 },
    { id: 'c8',  title: "Kun Qahramoni",   description: "100 XP to'pla",             type: 'xp',      target: 100, xpReward: 50 },
    { id: 'c9',  title: "Tezkor",          description: "50 XP to'pla",              type: 'xp',      target: 50,  xpReward: 30 },
    { id: 'c10', title: "Izchil",          description: "15 ta savol yech",          type: 'solve',   target: 15,  xpReward: 70 },
    { id: 'c11', title: "Super Aniq",      description: "8 ta to'g'ri javob ber",   type: 'correct', target: 8,   xpReward: 45 },
    { id: 'c12', title: "XP Shikori",      description: "75 XP to'pla",              type: 'xp',      target: 75,  xpReward: 40 },
];

function seededShuffle(arr, seed) {
    const result = [...arr];
    let s = seed;
    for (let i = result.length - 1; i > 0; i--) {
        s = (s * 1664525 + 1013904223) & 0x7fffffff;
        const j = s % (i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function generateForDate(dateStr) {
    const seed = parseInt(dateStr.replace(/-/g, ''), 10);
    return seededShuffle(POOL, seed).slice(0, 3).map(c => ({
        ...c, progress: 0, completed: false,
    }));
}

function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
}

export async function GET(req) {
    try {
        await connectDB();
        const session = parseSessionFromCookie(req.headers.get('cookie'));
        if (!session?.username) {
            return new Response(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });
        }

        const user = await User.findOne({ username: session.username });
        if (!user) return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const chalDate = user.dailyChallengesDate
            ? new Date(user.dailyChallengesDate).toISOString().split('T')[0]
            : null;

        if (chalDate !== todayStr) {
            user.dailyChallenges = generateForDate(todayStr);
            user.dailyChallengesDate = new Date(today.setHours(0, 0, 0, 0));
            await user.save();
        }

        return new Response(JSON.stringify({ challenges: user.dailyChallenges }), { status: 200 });
    } catch (error) {
        console.error('Challenges GET error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi' }), { status: 500 });
    }
}
