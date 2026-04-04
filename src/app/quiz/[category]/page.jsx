"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, ChevronRight, X, Zap, ArrowLeft, Trophy, Clock } from 'lucide-react';
import ResultsSummary from '@/components/ResultsSummary';

const DIFF_CONFIG = {
    Hard:   { label: 'Qiyin',  cls: 'bg-red-500/10 text-red-400 border border-red-500/30'    },
    Medium: { label: "O'rta",  cls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' },
    Easy:   { label: 'Oson',   cls: 'bg-green-500/10 text-green-400 border border-green-500/30'  },
};

export default function QuizCategoryPage() {
    const routeParams = useParams();
    const category = decodeURIComponent(routeParams?.category || '');
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showResults, setShowResults] = useState(false);

    const countsRef = useRef({ correct: 0, incorrect: 0, unanswered: 0 });
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch(`/api/quizs/${encodeURIComponent(category)}`);
                if (res.ok) {
                    const data = await res.json();
                    setQuestions(data.questions || []);
                }
            } catch (err) {
                console.error('Failed to load questions', err);
            } finally {
                setLoading(false);
            }
        }
        if (category) load();
    }, [category]);

    const current = questions[index];
    const total = questions.length;
    const isLastQuestion = index === total - 1;
    const progress = total ? ((index + 1) / total) * 100 : 0;

    const handleNext = async () => {
        if (!current) return;

        // Tanlanmagan — javobni ko'rsatmay o'tkazib yuborish
        if (selected === null) {
            countsRef.current.unanswered += 1;
            if (index + 1 < total) {
                setIndex(index + 1);
            } else {
                setShowResults(true);
            }
            return;
        }

        setAnswered(true);

        const correct = selected === current.correctAnswer;
        const xpReward = correct ? (current.xpReward || 0) : 0;

        if (correct) {
            countsRef.current.correct += 1;
        } else {
            countsRef.current.incorrect += 1;
        }

        try {
            await fetch('/api/user/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xpReward, correct }),
            });
        } catch (err) {
            console.error('Failed to persist answer', err);
        }

        setTimeout(() => {
            setSelected(null);
            setAnswered(false);
            if (index + 1 < total) {
                setIndex(index + 1);
            } else {
                setShowResults(true);
            }
        }, 500);
    };

    const handleRetry = () => {
        countsRef.current = { correct: 0, incorrect: 0, unanswered: 0 };
        setIndex(0);
        setSelected(null);
        setAnswered(false);
        setShowResults(false);
    };

    // ── Timer ────────────────────────────────────────────────
    useEffect(() => {
        if (!current || answered || showResults) return;
        const seconds = current.time || 30;
        setTimeLeft(seconds);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleNext();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [index, questions]);  // reset on question change

    useEffect(() => {
        if (answered) clearInterval(timerRef.current);
    }, [answered]);

    // ── Loading ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 gap-4">
                <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Quiz yuklanmoqda…</p>
            </div>
        );
    }

    if (!total) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 gap-3">
                <p className="text-gray-400">Bu kategoriyada savollar yo'q.</p>
                <button onClick={() => router.push('/quiz')} className="text-green-400 text-sm hover:underline">
                    Orqaga qaytish
                </button>
            </div>
        );
    }

    // ── Results ──────────────────────────────────────────────
    if (showResults) {
        return (
            <ResultsSummary
                totalQuestions={total}
                correctAnswers={countsRef.current.correct}
                incorrectAnswers={countsRef.current.incorrect}
                unanswered={countsRef.current.unanswered}
                category={category}
                onRetry={handleRetry}
                onHome={() => router.push('/quiz')}
            />
        );
    }

    // ── Quiz UI ──────────────────────────────────────────────
    const diff = DIFF_CONFIG[current.difficulty] || DIFF_CONFIG.Easy;

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">

            {/* ── Top bar ─────────────────────────────── */}
            <div className="bg-gray-900 border-b border-gray-800 px-3 sm:px-6 py-3">
                <div className="mx-auto max-w-2xl">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push('/quiz')}
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors shrink-0"
                            >
                                <ArrowLeft size={15} />
                            </button>
                            <div className="min-w-0">
                                <p className="text-white font-semibold text-sm leading-tight truncate max-w-[120px] sm:max-w-none">{category}</p>
                                <p className="text-gray-500 text-xs">{total} ta savol</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {current.xpReward > 0 && (
                                <span className="flex items-center gap-1 text-xs text-green-400 font-bold bg-green-900/20 px-2 py-1 rounded-lg border border-green-900/40">
                                    <Zap size={10} /> +{current.xpReward} XP
                                </span>
                            )}

                            {timeLeft !== null && (
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border transition-colors
                                    ${timeLeft <= Math.floor((current.time || 30) * 0.25)
                                        ? 'bg-red-900/40 border-red-700 text-red-400 animate-pulse'
                                        : timeLeft <= Math.floor((current.time || 30) * 0.5)
                                        ? 'bg-yellow-900/40 border-yellow-700 text-yellow-400'
                                        : 'bg-gray-800 border-gray-700 text-gray-300'
                                    }`}
                                >
                                    <Clock size={10} />
                                    {timeLeft}s
                                </div>
                            )}

                            <span className="text-gray-400 text-sm font-medium shrink-0">
                                <span className="text-white font-bold">{index + 1}</span>/{total}
                            </span>
                        </div>
                    </div>

                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Question body ─────────────────────── */}
            <div className="px-3 sm:px-6 py-4 sm:py-8 flex-1">
                <div className="mx-auto w-full max-w-2xl">

                    {/* Question card */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-1 rounded-lg">
                                Savol {index + 1}
                            </span>
                            {current.difficulty && (
                                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${diff.cls}`}>
                                    {diff.label}
                                </span>
                            )}
                        </div>
                        <h2 className="text-white text-base sm:text-xl font-semibold leading-relaxed">
                            {current.question}
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="flex flex-col gap-2.5">
                        {current.options.map((opt, i) => {
                            const isSelected   = selected === i;
                            const isCorrectOpt = answered && i === current.correctAnswer;
                            const isWrong      = answered && isSelected && !isCorrectOpt;

                            let container = 'border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800/80 cursor-pointer';
                            if (isCorrectOpt) container = 'border-green-500 bg-green-900/20 cursor-default';
                            else if (isWrong) container = 'border-red-500 bg-red-900/20 cursor-default';
                            else if (isSelected) container = 'border-green-500/60 bg-green-900/10 cursor-pointer';

                            let badge = 'bg-gray-800 text-gray-400';
                            if (isCorrectOpt) badge = 'bg-green-500 text-white';
                            else if (isWrong)    badge = 'bg-red-500 text-white';
                            else if (isSelected) badge = 'bg-green-600 text-white';

                            let textCls = 'text-gray-200';
                            if (isCorrectOpt) textCls = 'text-green-300';
                            else if (isWrong)    textCls = 'text-red-300';
                            else if (isSelected) textCls = 'text-white';

                            const icon = isCorrectOpt
                                ? <Check className="w-4 h-4" />
                                : isWrong
                                ? <X className="w-4 h-4" />
                                : isSelected
                                ? <Check className="w-4 h-4" />
                                : <span className="text-sm font-bold">{String.fromCharCode(65 + i)}</span>;

                            return (
                                <button
                                    key={i}
                                    onClick={() => !answered && setSelected(i)}
                                    disabled={answered}
                                    className={`group flex items-center gap-3 rounded-xl border-2 px-3 sm:px-5 py-3 sm:py-4 text-left transition-all duration-200 ${container}`}
                                >
                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${badge}`}>
                                        {icon}
                                    </span>
                                    <span className={`font-medium text-sm sm:text-base leading-relaxed transition-colors duration-200 ${textCls}`}>
                                        {opt}
                                    </span>
                                    {isCorrectOpt && (
                                        <span className="ml-auto text-xs font-semibold text-green-400 shrink-0">To'g'ri!</span>
                                    )}
                                    {isWrong && (
                                        <span className="ml-auto text-xs font-semibold text-red-400 shrink-0">Noto'g'ri</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom nav */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="hidden sm:flex items-center gap-1">
                            {Array.from({ length: Math.min(total, 10) }, (_, i) => (
                                <div
                                    key={i}
                                    className={`rounded-full transition-all duration-300 ${
                                        i < index ? 'w-2 h-2 bg-green-500'
                                        : i === index ? 'w-3 h-3 bg-green-400 ring-2 ring-green-400/30'
                                        : 'w-2 h-2 bg-gray-700'
                                    }`}
                                />
                            ))}
                            {total > 10 && <span className="text-gray-600 text-xs ml-1">+{total - 10}</span>}
                        </div>

                        <button
                            onClick={handleNext}
                            className={`ml-auto flex items-center gap-2 rounded-xl px-5 sm:px-7 py-3 sm:py-3.5 font-semibold text-white text-sm sm:text-base
                                transition-all duration-200 hover:scale-[1.02]
                                ${isLastQuestion
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 shadow-lg shadow-green-900/30'
                                    : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                        >
                            {isLastQuestion ? (
                                <><Trophy className="w-4 h-4" /> Yakunlash</>
                            ) : (
                                <><span>Keyingi</span><ChevronRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
