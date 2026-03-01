'use client'; // Bu interaktiv component ekanligini bildiradi

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [grade, setGrade] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!username || !password || !grade) {
            setError('Barcha maydonlarni to\'ldiring!');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, grade: parseInt(grade) }),
            });

            const data = await response.json();

            if (response.ok) {
                // Muvaffaqiyatli ro'yxatdan o'tgandan so'ng, login sahifasiga o'tkazamiz
                alert('Muvaffaqiyatli ro\'yxatdan o\'tdingiz! Endi tizimga kirishingiz mumkin.');
                router.push('/login');
            } else {
                // Serverdan kelgan xatolikni ko'rsatamiz
                setError(data.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Tarmoq xatosi: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2>Hisob Yaratish</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Parol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="number"
                    placeholder="Sinfingiz (masalan, 9)"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    style={styles.input}
                />
                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? 'Yuklanmoqda...' : 'Ro\'yxatdan o\'tish'}
                </button>
                {error && <p style={styles.error}>{error}</p>}
                <p style={styles.link} onClick={() => router.push('/login')}>
                    Hisobingiz bormi? Tizimga kirish
                </p>
            </form>
        </div>
    );
}

// Stil uchun oddiy obyekt (CSS modullari yoki Tailwind ishlatishingiz mumkin)
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' },
    form: { display: 'flex', flexDirection: 'column', padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
    input: { margin: '10px 0', padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' },
    button: { padding: '12px', fontSize: '16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    error: { color: 'red', marginTop: '10px' },
    link: { marginTop: '15px', color: '#007bff', cursor: 'pointer', textAlign: 'center' }
};