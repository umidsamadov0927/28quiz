"use client";

import { useEffect, useState } from "react";
import { Check, X, HelpCircle, RotateCcw, Home, Trophy, Zap } from "lucide-react";

function CircularProgress({ percentage }) {
    const [animatedPercent, setAnimatedPercent] = useState(0);
    const [displayPercent, setDisplayPercent] = useState(0);
    const radius = 80;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedPercent / 100) * circumference;

    useEffect(() => {
        const t = setTimeout(() => setAnimatedPercent(percentage), 200);
        return () => clearTimeout(t);
    }, [percentage]);

    useEffect(() => {
        if (animatedPercent === 0) return;
        const steps = 60;
        const increment = animatedPercent / steps;
        const stepTime = 1500 / steps;
        let current = 0;
        const interval = setInterval(() => {
            current += increment;
            if (current >= animatedPercent) {
                current = animatedPercent;
                clearInterval(interval);
            }
            setDisplayPercent(Math.round(current));
        }, stepTime);
        return () => clearInterval(interval);
    }, [animatedPercent]);

    const color =
        percentage >= 80 ? "#22c55e"  // green-500
        : percentage >= 50 ? "#3b82f6" // blue-500
        : percentage >= 30 ? "#f97316" // orange-500
        : "#ef4444";                    // red-500

    const message =
        percentage >= 80 ? "A'lo Natija!"
        : percentage >= 60 ? "Yaxshi Natija!"
        : percentage >= 40 ? "O'rtacha Natija"
        : "Ko'proq Harakat Qiling!";

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative">
                <svg width="200" height="200" className="-rotate-90">
                    <circle cx="100" cy="100" r={radius} fill="none" stroke="#1f2937" strokeWidth={strokeWidth} />
                    <circle
                        cx="100" cy="100" r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-[1500ms] ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white">{displayPercent}%</span>
                </div>
            </div>
            <p className="text-lg font-semibold text-gray-300">{message}</p>
        </div>
    );
}

export default function ResultsSummary({
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    unanswered,
    earnedXp = 0,
    category,
    onRetry,
    onHome,
}) {
    const percentage = totalQuestions > 0
        ? Math.min(100, Math.round((correctAnswers / totalQuestions) * 100))
        : 0;

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-950 px-4 py-12">
            <div className="w-full max-w-lg">

                {/* Header */}
                <div className="mb-2 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-green-900/40 border border-green-800 rounded-2xl mb-4">
                        <Trophy className="w-7 h-7 text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Test Natijalari</h1>
                    {category && (
                        <p className="text-gray-500 text-sm mt-1">{category} kategoriyasi</p>
                    )}
                </div>

                {/* XP earned */}
                {earnedXp > 0 && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-green-400 font-semibold text-sm">
                        <Zap size={16} />
                        +{earnedXp} XP qo'lga kiritildi
                    </div>
                )}

                {/* Circular progress */}
                <div className="my-6 flex justify-center">
                    <CircularProgress percentage={percentage} />
                </div>

                {/* Stats grid */}
                <div className="mb-4 grid grid-cols-3 gap-3">
                    {/* Correct */}
                    <div className="flex flex-col items-center gap-2 rounded-2xl bg-green-900/20 border border-green-800/60 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-900/60 border border-green-700">
                            <Check className="h-5 w-5 text-green-400" />
                        </div>
                        <span className="text-xs text-gray-500 text-center leading-tight">To'g'ri</span>
                        <div className="text-center">
                            <span className="text-2xl font-extrabold text-green-400">{correctAnswers}</span>
                            <span className="text-xs text-gray-600"> / {totalQuestions}</span>
                        </div>
                    </div>

                    {/* Incorrect — highlighted */}
                    <div className="flex flex-col items-center gap-2 rounded-2xl bg-red-900/20 border border-red-700/60 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-900/60 border border-red-700">
                            <X className="h-5 w-5 text-red-400" />
                        </div>
                        <span className="text-xs text-gray-500 text-center leading-tight">Noto'g'ri</span>
                        <div className="text-center">
                            <span className="text-2xl font-extrabold text-red-400">{incorrectAnswers}</span>
                            <span className="text-xs text-gray-600"> / {totalQuestions}</span>
                        </div>
                    </div>

                    {/* Unanswered */}
                    <div className="flex flex-col items-center gap-2 rounded-2xl bg-gray-800/60 border border-gray-700 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-700 border border-gray-600">
                            <HelpCircle className="h-5 w-5 text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-500 text-center leading-tight">Bo'sh</span>
                        <div className="text-center">
                            <span className="text-2xl font-extrabold text-gray-400">{unanswered}</span>
                            <span className="text-xs text-gray-600"> / {totalQuestions}</span>
                        </div>
                    </div>
                </div>

                {/* Incorrect callout — prominent */}
                {incorrectAnswers > 0 && (
                    <div className="mb-4 flex items-center gap-3 rounded-xl bg-red-900/20 border border-red-800/60 px-4 py-3">
                        <X className="h-5 w-5 text-red-400 shrink-0" />
                        <p className="text-sm text-red-300">
                            <span className="font-bold text-red-400">{incorrectAnswers} ta</span> savolga noto'g'ri javob berdingiz
                            {' '}— bu <span className="font-bold text-red-400">{Math.min(100, Math.round((incorrectAnswers / totalQuestions) * 100))}%</span>
                        </p>
                    </div>
                )}
                {incorrectAnswers === 0 && (
                    <div className="mb-4 flex items-center gap-3 rounded-xl bg-green-900/20 border border-green-800/60 px-4 py-3">
                        <Check className="h-5 w-5 text-green-400 shrink-0" />
                        <p className="text-sm text-green-300 font-medium">Barcha savollarga to'g'ri javob berdingiz!</p>
                    </div>
                )}

                {/* Progress bar breakdown */}
                <div className="mb-8 bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
                    {[
                        { label: "To'g'ri", count: correctAnswers, color: "bg-green-500", textColor: "text-green-400" },
                        { label: "Noto'g'ri", count: incorrectAnswers, color: "bg-red-500", textColor: "text-red-400" },
                        { label: "Bo'sh", count: unanswered, color: "bg-gray-600", textColor: "text-gray-400" },
                    ].map(({ label, count, color, textColor }) => {
                        const pct = totalQuestions > 0 ? Math.min(100, Math.round((count / totalQuestions) * 100)) : 0;
                        return (
                            <div key={label}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-400">{label}</span>
                                    <span className={`text-xs font-semibold ${textColor}`}>{count} ta ({pct}%)</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${color} rounded-full transition-all duration-700`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onRetry}
                        className="flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 px-6 py-3.5 font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-green-900/30 active:scale-[0.98]"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Qayta Urinish
                    </button>
                    <button
                        onClick={onHome}
                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 hover:bg-gray-800 px-6 py-3.5 font-semibold text-gray-300 hover:text-white transition-all duration-200 active:scale-[0.98]"
                    >
                        <Home className="h-4 w-4" />
                        Quiz Ro'yxatiga Qaytish
                    </button>
                </div>

            </div>
        </div>
    );
}
