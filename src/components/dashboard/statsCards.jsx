import { Zap, Target, Flame, Trophy } from 'lucide-react';

const statItems = [
    { id: 'xp', label: 'Total XP', icon: Zap, color: 'text-green-400', bg: 'bg-green-400/10' },
    { id: 'questions', label: 'Questions Solved', icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'streak', label: 'Day Streak', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'rank', label: 'Global Rank', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
];

export default function StatsCards({ stats, hideRank = false }) {
    const values = {
        xp: stats?.totalXp?.toLocaleString() ?? '—',
        questions: stats?.questionsAnswered?.toString() ?? '—',
        streak: stats?.currentStreak?.toString() ?? '—',
        rank: stats?.rank != null ? `#${stats.rank}` : '—',
    };

    const visibleItems = hideRank ? statItems.filter(i => i.id !== 'rank') : statItems;
    const colClass = visibleItems.length === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

    return (
        <div className={`grid ${colClass} gap-4`}>
            {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                    <div
                        key={item.id}
                        className="bg-gray-900 rounded-2xl border border-gray-800 p-5 hover:border-green-900 transition-colors"
                    >
                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                            <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <p className="text-2xl font-bold text-white mb-1">{values[item.id]}</p>
                        <p className="text-sm text-gray-500">{item.label}</p>
                    </div>
                );
            })}
        </div>
    );
}