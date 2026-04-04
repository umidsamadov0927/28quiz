import { connectDB } from '../../config/mongodb.js';
import { Question } from '../../models/Question.js';

export async function GET(req, { params }) {
    try {
        await connectDB();

        // Unwrap the Promise for params
        const resolvedParams = await params;

        // Prefer resolvedParams.category, but fall back to parsing the request URL
        let category = resolvedParams && resolvedParams.category;

        if (!category) {
            try {
                // req.nextUrl is available in Next; fallback to URL parsing
                const pathname = req.nextUrl?.pathname || new URL(req.url).pathname;
                // pathname like /api/quizs/Python -> split and take last segment
                const parts = pathname.split('/').filter(Boolean);
                category = parts[parts.length - 1];
            } catch (e) {
                category = null;
            }
        }

        if (!category) {
            console.error('[quizs/category] missing category param. req.url=', req.url);
            return new Response(JSON.stringify({ message: 'Missing category', url: req.url }), { status: 400 });
        }

        // params may be URL-encoded; decode and normalize
        try { category = decodeURIComponent(category); } catch (e) {}
        const normalized = category.trim();

        // helper to escape regex special chars
        const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
        const categoryRegex = new RegExp(`^${escapeRegExp(normalized)}$`, 'i');

        console.log('[quizs/category] request for category:', { raw: resolvedParams?.category, decoded: category, normalized, url: req.url });

        // find up to 31 questions for this category (case-insensitive)
        const qs = await Question.find({ category: categoryRegex }).limit(31).lean();

        // shuffle for randomness
        for (let i = qs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [qs[i], qs[j]] = [qs[j], qs[i]];
        }

        return new Response(JSON.stringify({ questions: qs }), { status: 200 });
    } catch (err) {
        console.error('Get category questions error:', err);
        return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
    }
}
