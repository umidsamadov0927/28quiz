'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        const filteredValue = value.replace(/[^a-zA-Z0-9_-]/g, '');
        setUsername(filteredValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                Cookies.set('session_token', JSON.stringify(data.user), { expires: 1 });
                setTimeout(() => {
                    router.push('/');
                    router.refresh();
                }, 100);
            } else {
                setError(data.message || 'Kirishda xatolik yuz berdi');
                setLoading(false);
            }
        } catch (err) {
            setError('Tarmoq xatosi: ' + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600/10 border border-green-500/20 mb-4">
                        <User className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Xush kelibsiz</h1>
                    <p className="text-gray-400 mt-2">Akkauntingizga kiring va bilimingizni oshiring</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">
                                Foydalanuvchi nomi
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-green-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="username"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">
                                Parol
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-green-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-xl text-sm animate-shake">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Kirish
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                        <p className="text-gray-400">
                            Hisobingiz yo'qmi?{' '}
                            <Link
                                href="/signup"
                                className="text-green-500 hover:text-green-400 font-medium transition-colors"
                            >
                                Ro'yxatdan o'tish
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Optional: Back to Home link */}
                <div className="mt-6 text-center">
                    <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                        ← Asosiy sahifaga qaytish
                    </Link>
                </div>
            </div>
        </div>
    );
}
