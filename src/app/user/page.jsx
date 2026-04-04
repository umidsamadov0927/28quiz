'use client';

import { useState, useEffect } from 'react';
import {
    Zap, Target, Flame, Trophy, Calendar,
    Mail, TrendingUp, Star, Award, CheckCircle,
    XCircle, ChevronUp, Minus,
} from 'lucide-react';

// ─── Level formula (same as backend) ─────────────────────────
function getLevelInfo(xp) {
    let level = 1;
    let accumulated = 0;
    while (accumulated + level * 500 <= xp) {
        accumulated += level * 500;
        level++;
    }
    const xpInLevel = xp - accumulated;
    const xpNeeded = level * 500;
    return {
        level,
        xpInLevel,
        xpNeeded,
        percent: Math.round((xpInLevel / xpNeeded) * 100),
        totalToNextLevel: accumulated + xpNeeded,
    };
}

// ─── Stat card ────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, bg, sub }) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">{value ?? '—'}</p>
            <p className="text-sm text-gray-500">{label}</p>
            {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
        </div>
    );
}

// ─── Activity bar ─────────────────────────────────────────────
function ActivityBar({ day, xp, maxXp, isToday }) {
    const pct = maxXp > 0 ? Math.max(4, Math.round((xp / maxXp) * 72)) : 4;
    return (
        <div className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-xs text-gray-600 h-4">{xp > 0 ? `+${xp}` : ''}</span>
            <div className="w-full max-w-[28px] bg-gray-800 rounded-lg flex items-end overflow-hidden" style={{ height: 72 }}>
                <div
                    className={`w-full rounded-lg transition-all duration-700 ${isToday ? 'bg-green-400' : 'bg-green-700'}`}
                    style={{ height: pct }}
                />
            </div>
            <span className={`text-xs ${isToday ? 'text-green-400 font-semibold' : 'text-gray-600'}`}>{day}</span>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────
export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [challenges, setChallenges] = useState([]);

    useEffect(() => {
        async function load() {
            try {
                const [meRes, chalRes] = await Promise.all([
                    fetch('/api/auth/me'),
                    fetch('/api/user/challenges'),
                ]);
                if (!meRes.ok) { setError('Foydalanuvchi topilmadi'); return; }
                const { user } = await meRes.json();
                setUser(user);
                if (chalRes.ok) {
                    const d = await chalRes.json();
                    if (d?.challenges) setChallenges(d.challenges);
                }
            } catch {
                setError('Serverga ulanishda xato');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Yuklanmoqda…</p>
            </div>
        </div>
    );

    if (error || !user) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950">
            <p className="text-red-400">{error || 'Xato yuz berdi'}</p>
        </div>
    );

    const xp = user.xp || 0;
    const { level, xpInLevel, xpNeeded, percent, totalToNextLevel } = getLevelInfo(xp);
    const questionsSolved = user.questionsSolved || 0;
    const correctAnswers = user.correctAnswers || 0;
    const incorrectAnswers = questionsSolved - correctAnswers;
    const accuracy = questionsSolved > 0 ? Math.round((correctAnswers / questionsSolved) * 100) : 0;
    const dayStreak = user.dayStreak || 0;

    // Last 7 days activity
    const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const activityMap = {};
    (user.activity || []).forEach(a => {
        const key = new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' });
        activityMap[key] = (activityMap[key] || 0) + (a.xp || 0);
    });
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = days[(today - 6 + i + 7) % 7];
        return { day: d, xp: activityMap[d] || 0, isToday: d === todayKey };
    });
    const maxDayXp = Math.max(...last7.map(d => d.xp), 1);

    const joinedDate = user.joinedAt
        ? new Date(user.joinedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    // Achievements
    const achievements = [
        { label: 'Birinchi Qadam', desc: 'Birinchi savolni yechdi', earned: questionsSolved >= 1, icon: Star },
        { label: 'Quiz Jangchisi', desc: '10+ savol yechildi', earned: questionsSolved >= 10, icon: Award },
        { label: 'XP Ovchisi', desc: '100+ XP to\'plandi', earned: xp >= 100, icon: Zap },
        { label: 'Olov!', desc: '3+ kunlik streak', earned: dayStreak >= 3, icon: Flame },
        { label: 'Aniq Nishon', desc: '80%+ to\'g\'ri javoblar (5+)', earned: accuracy >= 80 && questionsSolved >= 5, icon: Target },
        { label: 'Veteran', desc: 'Level 5 ga yetildi', earned: level >= 5, icon: Trophy },
    ];
    const earnedCount = achievements.filter(a => a.earned).length;

    return (
        <div className="p-6 space-y-5 bg-gray-950 min-h-screen">

            {/* ── Profile card ───────────────────────────── */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 bg-green-900 border-2 border-green-700 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-green-400">
                            {(user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-gray-900">
                            Lv {level}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                            <span className="text-xs bg-green-900/40 border border-green-800 text-green-400 px-2.5 py-1 rounded-xl font-semibold">
                                Level {level}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-2">
                            {user.email && (
                                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                                    <Mail size={13} /> {user.email}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                                <Calendar size={13} /> {joinedDate}
                            </span>
                        </div>

                        {/* XP bar */}
                        <div className="mt-4 max-w-sm">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-gray-500">Level {level} → {level + 1}</span>
                                <span className="text-xs text-green-400 font-semibold">
                                    {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
                                </span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-700"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                Keyingi levelga {(xpNeeded - xpInLevel).toLocaleString()} XP qoldi · {percent}% bajarildi
                            </p>
                        </div>
                    </div>

                    {/* Total XP */}
                    <div className="flex flex-col items-center bg-green-950 border border-green-900 rounded-2xl px-5 py-4 shrink-0">
                        <Zap size={18} className="text-green-400 mb-1" />
                        <span className="text-2xl font-extrabold text-white">{xp.toLocaleString()}</span>
                        <span className="text-xs text-green-400 mt-0.5">Jami XP</span>
                    </div>
                </div>
            </div>

            {/* ── Stats row ──────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Target}     label="Savol yechildi"   value={questionsSolved}        color="text-blue-400"   bg="bg-blue-400/10"   />
                <StatCard icon={CheckCircle} label="To'g'ri javoblar" value={correctAnswers}         color="text-green-400"  bg="bg-green-400/10"  sub={`${accuracy}% aniqlik`} />
                <StatCard icon={XCircle}    label="Noto'g'ri javoblar" value={incorrectAnswers}      color="text-red-400"    bg="bg-red-400/10"    />
                <StatCard icon={Flame}      label="Kunlik streak"    value={`${dayStreak} kun`}      color="text-orange-400" bg="bg-orange-400/10" />
            </div>

            {/* ── Activity + Detail ──────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Activity chart */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-white">Haftalik faollik</h3>
                            <p className="text-gray-500 text-xs mt-0.5">So'nggi 7 kun · XP bo'yicha</p>
                        </div>
                        <span className="flex items-center gap-1.5 text-green-400 text-xs font-semibold bg-green-900/30 border border-green-900/50 px-2.5 py-1 rounded-lg">
                            <Zap size={11} /> Bugun +{user.dailyXp || 0} XP
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        {last7.map(({ day, xp: dayXp, isToday }) => (
                            <ActivityBar key={day} day={day} xp={dayXp} maxXp={maxDayXp} isToday={isToday} />
                        ))}
                    </div>
                </div>

                {/* Detail stats */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-5">Statistika</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Jami XP',           value: xp.toLocaleString(),             icon: Zap,         color: 'text-green-400'  },
                            { label: 'Bugungi XP',        value: `+${user.dailyXp || 0}`,         icon: TrendingUp,  color: 'text-blue-400'   },
                            { label: 'To\'g\'ri javoblar', value: correctAnswers,                  icon: CheckCircle, color: 'text-green-400'  },
                            { label: 'Noto\'g\'ri',        value: incorrectAnswers,                icon: XCircle,     color: 'text-red-400'    },
                            { label: 'Aniqlik',           value: `${accuracy}%`,                  icon: Target,      color: 'text-yellow-400' },
                            { label: 'Streak',            value: `${dayStreak} kun`,              icon: Flame,       color: 'text-orange-400' },
                            { label: 'Keyingi levelga',   value: `${(xpNeeded - xpInLevel).toLocaleString()} XP`, icon: ChevronUp, color: 'text-purple-400' },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Icon size={13} className={color} />
                                    {label}
                                </div>
                                <span className="text-white text-sm font-semibold">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Kunlik Vazifalar ────────────────────────── */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="font-semibold text-white">Kunlik Vazifalar</h3>
                        <p className="text-gray-500 text-xs mt-0.5">Har kuni yangilanadi · Bajarsa XP olasiz</p>
                    </div>
                    <span className="text-xs font-semibold text-green-400 bg-green-900/30 border border-green-900/50 px-3 py-1.5 rounded-xl">
                        {challenges.filter(c => c.completed).length} / {challenges.length} bajarildi
                    </span>
                </div>

                {challenges.length === 0 ? (
                    <p className="text-gray-600 text-sm">Yuklanmoqda…</p>
                ) : (
                    <div className="space-y-3">
                        {challenges.map((ch, i) => {
                            const pct = Math.min(100, Math.round(((ch.progress || 0) / ch.target) * 100));
                            return (
                                <div key={i} className={`rounded-xl border p-4 transition-all ${
                                    ch.completed
                                        ? 'bg-green-900/15 border-green-800/50'
                                        : 'bg-gray-800/40 border-gray-700/50'
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {ch.completed
                                                ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                                                : <div className="w-4 h-4 rounded-full border-2 border-gray-600 shrink-0" />
                                            }
                                            <span className={`text-sm font-semibold ${ch.completed ? 'text-green-400' : 'text-white'}`}>
                                                {ch.title}
                                            </span>
                                        </div>
                                        <span className={`flex items-center gap-1 text-xs font-bold ${ch.completed ? 'text-green-400' : 'text-gray-500'}`}>
                                            <Zap size={11} /> +{ch.xpReward} XP
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2 ml-6">{ch.description}</p>
                                    <div className="ml-6">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden mr-3">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${ch.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 shrink-0">
                                                {Math.min(ch.progress || 0, ch.target)} / {ch.target}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Yutuqlar (Badglar) ──────────────────────── */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="font-semibold text-white">Yutuqlar (Badglar)</h3>
                        <p className="text-gray-500 text-xs mt-0.5">{earnedCount} / {achievements.length} ta qo'lga kiritildi</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-yellow-400 bg-yellow-900/20 border border-yellow-900/40 px-3 py-1.5 rounded-xl">
                        <Trophy size={12} /> {earnedCount} ta
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {achievements.map(({ label, desc, earned, icon: Icon }) => (
                        <div
                            key={label}
                            className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all ${
                                earned
                                    ? 'bg-green-950/40 border-green-800/60'
                                    : 'bg-gray-800/30 border-gray-800'
                            }`}
                        >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 ${
                                earned ? 'bg-green-900/60 border border-green-700' : 'bg-gray-700/50 border border-gray-700'
                            }`}>
                                <Icon size={20} className={earned ? 'text-green-400' : 'text-gray-600'} />
                            </div>
                            <p className={`text-xs font-semibold mb-0.5 ${earned ? 'text-white' : 'text-gray-600'}`}>{label}</p>
                            <p className={`text-xs leading-tight ${earned ? 'text-gray-400' : 'text-gray-700'}`}>{desc}</p>
                            {earned && (
                                <span className="mt-2 text-xs text-green-400 font-bold">✓ Qo'lga kiritildi</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
