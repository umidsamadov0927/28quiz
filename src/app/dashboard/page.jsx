'use client';

import { useState, useEffect, useRef } from 'react';
import { Zap, TrendingUp, Clock, Code, Flame } from 'lucide-react';
import StatsCards from '@/components/dashboard/statsCards';
import ActivityChart from '@/components/dashboard/activityChart';

const difficultyStyle = {
    Easy:   'bg-green-900/40 text-green-400',
    Medium: 'bg-yellow-900/40 text-yellow-400',
    Hard:   'bg-red-900/40 text-red-400',
};

export default function Dashboard() {
    const [user, setUser]             = useState(null);
    const [todayXp, setTodayXp]       = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [activity, setActivity]     = useState([]);
    const [myRank, setMyRank]         = useState(null);

    const [questions, setQuestions]   = useState([]);
    const [qIndex, setQIndex]         = useState(0);
    const [selected, setSelected]     = useState(null);
    const [answered, setAnswered]     = useState(false);
    const [qLoading, setQLoading]     = useState(true);

    // Load all data in parallel
    useEffect(() => {
        async function load() {
            try {
                const [meRes, lbRes, qRes] = await Promise.all([
                    fetch('/api/auth/me'),
                    fetch('/api/leaderboard?page=1&limit=8'),
                    fetch('/api/questions/random?limit=8'),
                ]);
                if (meRes.ok) {
                    const { user } = await meRes.json();
                    if (user) {
                        setUser({
                            name: user.username || 'friend',
                            totalXp: user.xp || 0,
                            questionsAnswered: user.questionsSolved || 0,
                            correctAnswers: user.correctAnswers || 0,
                            currentStreak: user.dayStreak || 0,
                            level: user.level || 1,
                        });
                        setTodayXp(user.dailyXp || 0);
                        setActivity(user.activity || []);
                    }
                }
                if (lbRes.ok) {
                    const data = await lbRes.json();
                    setLeaderboard(data.leaderboard || []);
                    if (data.myRank) setMyRank(data.myRank);
                }
                if (qRes.ok) {
                    const d = await qRes.json();
                    if (d?.questions?.length) setQuestions(d.questions);
                }
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setQLoading(false);
            }
        }
        load();
    }, []);

    const question = questions[qIndex];

    const handleSubmit = async () => {
        if (selected === null || !question) return;
        setAnswered(true);
        const correct = selected === question.correctAnswer;
        const xpReward = correct ? (question.xpReward || 0) : 0;
        if (correct) setTodayXp(p => p + xpReward);
        try {
            const res = await fetch('/api/user/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xpReward, correct }),
            });
            if (res.ok) {
                const { user: updated } = await res.json();
                if (updated) {
                    setUser(u => ({
                        ...u,
                        totalXp: updated.xp,
                        questionsAnswered: updated.questionsSolved || u.questionsAnswered,
                        correctAnswers: updated.correctAnswers || u.correctAnswers,
                        currentStreak: updated.dayStreak || u.currentStreak,
                    }));
                    setTodayXp(updated.dailyXp || todayXp);
                    setActivity(updated.activity || activity);
                }
            }
        } catch (err) {
            console.error('failed to persist activity', err);
        }
    };

    const handleNext = () => {
        setQIndex(p => (p + 1) % questions.length);
        setSelected(null);
        setAnswered(false);
    };

    return (
        <div className="p-6 space-y-6 bg-gray-950 min-h-screen">

            {/* Welcome */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Xush kelibsiz, {user ? user.name : 'do\'st'}!
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Bugun ham bilimingizni oshiring</p>
                </div>
                <div className="flex items-center gap-1.5 bg-green-950 border border-green-900 text-green-400 text-sm font-semibold px-3 py-1.5 rounded-lg">
                    <Zap size={14} />
                    +{todayXp} XP bugun
                </div>
            </div>

            {/* Stats */}
            <StatsCards
                stats={{
                    totalXp: user?.totalXp,
                    questionsAnswered: user?.questionsAnswered,
                    currentStreak: user?.currentStreak,
                    rank: myRank,
                }}
            />

            {/* Main Grid */}
            <div className="grid grid-cols-3 gap-6">

                {/* Left 2/3 */}
                <div className="col-span-2 space-y-6">
                    <ActivityChart
                        data={activity.length ? activity.map(a => ({
                            day: new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' }),
                            xp: a.xp,
                        })) : []}
                    />

                    {/* Quick Quiz */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-semibold text-white">Tez Quiz</h3>
                            <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                                <TrendingUp size={14} />
                                {questions.length} ta savol
                            </span>
                        </div>

                        {qLoading ? (
                            <div className="flex items-center gap-2 text-gray-500 text-sm py-6">
                                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                Yuklanmoqda…
                            </div>
                        ) : !question ? (
                            <p className="text-gray-500 text-sm py-6">Savollar topilmadi</p>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${difficultyStyle[question.difficulty] || difficultyStyle.Easy}`}>
                                        {question.difficulty || 'Easy'}
                                    </span>
                                    <span className="text-gray-400 text-sm">{question.category}</span>
                                    <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Zap size={12} className="text-green-400" /> +{question.xpReward || 0} XP
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} /> {question.time || 30}s
                                        </span>
                                    </div>
                                </div>

                                <p className="text-white font-medium mb-3">{question.question}</p>

                                {question.code && (
                                    <div className="bg-gray-800 rounded-xl p-4 mb-4">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                                            <Code size={12} /> Code
                                        </div>
                                        <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">{question.code}</pre>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    {(question.options || []).map((opt, i) => {
                                        let style = 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600';
                                        if (answered) {
                                            if (i === question.correctAnswer) style = 'bg-green-900/40 border-green-600 text-green-400';
                                            else if (i === selected) style = 'bg-red-900/40 border-red-600 text-red-400';
                                        } else if (selected === i) {
                                            style = 'bg-green-900 border-green-600 text-green-400';
                                        }
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => !answered && setSelected(i)}
                                                className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border ${style}`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-4">
                                    {!answered ? (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={selected === null}
                                            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
                                        >
                                            Javobni Yuborish
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleNext}
                                            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
                                        >
                                            Keyingi Savol →
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right 1/3 — Leaderboard */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <p className="font-semibold text-white">Global Reyting</p>
                    <p className="text-gray-500 text-xs mt-0.5 mb-5">
                        {myRank ? `Sizning o'rningiz: #${myRank}` : 'Top o\'yinchilar'}
                    </p>
                    <div className="space-y-2">
                        {leaderboard.map((u, idx) => {
                            const isYou = user && u.username === user.name;
                            return (
                                <div
                                    key={u._id || idx}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                        isYou ? 'bg-green-900/20 border border-green-900/40' : 'hover:bg-gray-800'
                                    }`}
                                >
                                    <div className="w-6 text-center shrink-0">
                                        <span className="text-gray-500 text-sm font-medium">{idx + 1}</span>
                                    </div>
                                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                                        {(u.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{u.username}</p>
                                        <p className="text-xs text-gray-500">Level {u.level || 1}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-semibold text-green-400">{(u.xp || 0).toLocaleString()} XP</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
