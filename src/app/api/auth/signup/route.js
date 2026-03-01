import bcrypt from 'bcryptjs';
import { connectDB } from '../../config/mongodb.js';
import { User } from '../../models/User.js';

export async function POST(req) {
    try {
        await connectDB();

        const { username, password, grade } = await req.json();

        if (!username || !password || !grade) {
            return new Response(JSON.stringify({ message: 'Username parol va sinf majburiy' }), { status: 400 });
        }

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return new Response(JSON.stringify({ message: 'Bunday username mavjud' }), { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            username,
            password: hashedPassword,
            grade: parseInt(grade, 10)
        });

        return new Response(JSON.stringify({ message: 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tdi' }), { status: 201 });

    } catch (error) {
        console.error('Signup error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi yuz berdi: ' + error.message }), { status: 500 });
    }
}
