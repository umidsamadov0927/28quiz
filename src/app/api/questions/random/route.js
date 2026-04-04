import { connectDB } from '../../config/mongodb.js';
import { Question } from '../../models/Question.js';

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const limit = Math.min(10, parseInt(searchParams.get('limit') || '5'));

        const questions = await Question.aggregate([{ $sample: { size: limit } }]);
        return new Response(JSON.stringify({ questions }), { status: 200 });
    } catch (error) {
        console.error('Random questions error:', error);
        return new Response(JSON.stringify({ message: 'Server xatosi' }), { status: 500 });
    }
}
