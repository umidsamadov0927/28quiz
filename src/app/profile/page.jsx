'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const session = Cookies.get('session_token');
        if (!session) {
            router.push('/login');
            return;
        }
        try {
            setUser(JSON.parse(session));
        } catch {
            router.push('/login');
        }
    }, [router]);

    const handleLogout = () => {
        Cookies.remove('session_token');
        router.push('/login');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (!user) {
        return (
            <div style={styles.container}>
                <p style={styles.loading}>Yuklanmoqda...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.avatar}>
                        {user.username ? user.username[0].toUpperCase() : '?'}
                    </div>
                    <div>
                        <h2 style={styles.username}>{user.username}</h2>
                        <p style={styles.grade}>{user.grade}-sinf o'quvchisi</p>
                    </div>
                </div>

                <hr style={styles.divider} />

                {/* Stats */}
                <div style={styles.statsGrid}>
                    <div style={styles.statBox}>
                        <span style={styles.statValue}>{user.level ?? 1}</span>
                        <span style={styles.statLabel}>Daraja</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={styles.statValue}>{user.xp ?? 0}</span>
                        <span style={styles.statLabel}>XP</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={styles.statValue}>{user.questionsSolved ?? 0}</span>
                        <span style={styles.statLabel}>Yechilgan</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={styles.statValue}>{user.dayStreak ?? 0}</span>
                        <span style={styles.statLabel}>Kun streak</span>
                    </div>
                </div>

                <hr style={styles.divider} />

                {/* Info */}
                <div style={styles.infoSection}>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Foydalanuvchi nomi</span>
                        <span style={styles.infoValue}>{user.username}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Sinf</span>
                        <span style={styles.infoValue}>{user.grade}-sinf</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Qo'shilgan sana</span>
                        <span style={styles.infoValue}>{formatDate(user.joinedAt)}</span>
                    </div>
                </div>

                <button onClick={handleLogout} style={styles.logoutButton}>
                    Chiqish
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
        padding: '20px',
    },
    loading: {
        fontSize: '16px',
        color: '#555',
    },
    card: {
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '480px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '20px',
    },
    avatar: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: '#007bff',
        color: 'white',
        fontSize: '28px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    username: {
        margin: '0 0 4px 0',
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#222',
    },
    grade: {
        margin: 0,
        fontSize: '14px',
        color: '#888',
    },
    divider: {
        border: 'none',
        borderTop: '1px solid #ddd',
        margin: '20px 0',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '20px',
    },
    statBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#f0f2f5',
        borderRadius: '8px',
        padding: '14px 8px',
    },
    statValue: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#007bff',
    },
    statLabel: {
        fontSize: '12px',
        color: '#888',
        marginTop: '4px',
    },
    infoSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '24px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        background: '#f9f9f9',
        borderRadius: '4px',
        border: '1px solid #ddd',
    },
    infoLabel: {
        fontSize: '14px',
        color: '#888',
    },
    infoValue: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#222',
    },
    logoutButton: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        background: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};
