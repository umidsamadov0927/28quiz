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

function computeLevel(xp) {
    let level = 1, accumulated = 0;
    while (accumulated + level * 500 <= xp) { accumulated += level * 500; level++; }
    return level;
}

function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
}

export async function POST(req) {
    try {
        await connectDB();
        const cookie = req.headers.get('cookie');
        const session = parseSessionFromCookie(cookie);
        if (!session?.username) {
            return new Response(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });
        }

        let { xpReward = 0, correct = false } = await req.json();
        if (!correct) xpReward = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const user = await User.findOne({ username: session.username });
        if (!user) return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });

        // ── Streak logic ───────────────────────────────────────
        const todayEntryExists = user.activity.some(a => isSameDay(new Date(a.date), today));
        if (!todayEntryExists) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const hadYesterday = user.activity.some(a =>
                isSameDay(new Date(a.date), yesterday) && (a.questions || 0) > 0
            );
            user.dayStreak = hadYesterday ? (user.dayStreak || 0) + 1 : 1;
        }

        // ── XP ─────────────────────────────────────────────────
        if (xpReward) {
            user.xp = (user.xp || 0) + xpReward;
            if (!user.dailyXpDate || !isSameDay(new Date(user.dailyXpDate), today)) {
                user.dailyXp = xpReward;
                user.dailyXpDate = today;
            } else {
                user.dailyXp = (user.dailyXp || 0) + xpReward;
            }
        }

        // ── Level ──────────────────────────────────────────────
        user.level = computeLevel(user.xp || 0);

        // ── Question counts ────────────────────────────────────
        user.questionsSolved = (user.questionsSolved || 0) + 1;
        if (correct) user.correctAnswers = (user.correctAnswers || 0) + 1;

        // ── Activity array ─────────────────────────────────────
        let entry = user.activity.find(a => isSameDay(new Date(a.date), today));
        if (!entry) {
            entry = { date: today, xp: xpReward, questions: 1 };
            user.activity.push(entry);
        } else {
            entry.xp = (entry.xp || 0) + xpReward;
            entry.questions = (entry.questions || 0) + 1;
        }
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - 31);
        user.activity = user.activity.filter(a => new Date(a.date) >= cutoff);

        // ── Daily challenges progress ──────────────────────────
        let challengeBonus = 0;
        const todayStr = today.toISOString().split('T')[0];
        const chalDate = user.dailyChallengesDate
            ? new Date(user.dailyChallengesDate).toISOString().split('T')[0]
            : null;

        if (chalDate === todayStr && Array.isArray(user.dailyChallenges)) {
            user.dailyChallenges.forEach(ch => {
                if (ch.completed) return;
                if (ch.type === 'solve')   ch.progress = (ch.progress || 0) + 1;
                if (ch.type === 'correct' && correct) ch.progress = (ch.progress || 0) + 1;
                if (ch.type === 'xp' && xpReward > 0) ch.progress = (ch.progress || 0) + xpReward;
                if ((ch.progress || 0) >= ch.target) {
                    ch.completed = true;
                    challengeBonus += ch.xpReward || 0;
                }
            });
        }

        if (challengeBonus > 0) {
            user.xp += challengeBonus;
            user.dailyXp = (user.dailyXp || 0) + challengeBonus;
            user.level = computeLevel(user.xp);
            if (entry) entry.xp = (entry.xp || 0) + challengeBonus;
        }

        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        return new Response(JSON.stringify({ user: userObj, challengeBonus }), { status: 200 });
    } catch (error) {
        console.error('Activity POST error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi' }), { status: 500 });
    }
}
