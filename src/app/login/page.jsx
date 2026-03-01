'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; 

export default function LoginPage() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const response = await fetch('/api/auth/signin', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            Cookies.set('session_token', JSON.stringify(data.user), { expires: 1 });
            router.push('/');
        } else {
            setError(data.message || 'Login failed');
        }
    }

return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2>Tizimga Kirish</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="text"
                    placeholder="Parol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Kirish</button>
                {error && <p style={styles.error}>{error}</p>}
                <p style={styles.link} onClick={() => router.push('/signup')}>
                    Hisobingiz yo'qmi? Ro'yxatdan o'tish
                </p>
            </form>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' },
    form: { display: 'flex', flexDirection: 'column', padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
    input: { margin: '10px 0', padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' },
    button: { padding: '12px', fontSize: '16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    error: { color: 'red', marginTop: '10px' },
    link: { marginTop: '15px', color: '#007bff', cursor: 'pointer', textAlign: 'center' }
};