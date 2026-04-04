import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('session_token');

        return new Response(JSON.stringify({ message: 'Muvaffaqiyatli chiqish' }), { status: 200 });
    } catch (error) {
        console.error('Logout error:', error);
        return new Response(JSON.stringify({ message: 'Chiqishda xato yuz berdi' }), { status: 500 });
    }
}
