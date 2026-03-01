import { connectDB } from '../../config/mongodb.js';
import { User } from '../../models/User.js';

export async function GET() {
    try {
        await connectDB();

        const users = await User.find().select('-password');
        return new Response(JSON.stringify({ users }), { status: 200 });

    } catch (error) {
        console.error('Get users error:', error);
        return new Response(JSON.stringify({ message: "Foydalanuvchilarni o'qishda xato yuz berdi" }), { status: 500 });
    }
}