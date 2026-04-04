import bcrypt from 'bcryptjs';
import { connectDB } from '../../config/mongodb.js';
import { User } from '../../models/User.js';

export async function POST(req) {
    try {
        await connectDB();

        const { username, password, email } = await req.json();

        if (!username || !password) {
            return new Response(JSON.stringify({ message: 'Username va parol majburiy' }), { status: 400 });
        }

        // Check if user exists by username
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return new Response(JSON.stringify({ message: 'Bunday username mavjud' }), { status: 409 });
        }

        // Check if email exists (if provided)
        if (email) {
            const existingUserByEmail = await User.findOne({ email });
            if (existingUserByEmail) {
                return new Response(JSON.stringify({ message: 'Bunday email bilan akkaunt mavjud' }), { status: 409 });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            username,
            email: email || null,
            password: hashedPassword
        });

        return new Response(JSON.stringify({ message: 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tdi' }), { status: 201 });

    } catch (error) {
        console.error('Signup error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi yuz berdi: ' + error.message }), { status: 500 });
    }
}
