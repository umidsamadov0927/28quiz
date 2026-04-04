import mongoose from 'mongoose';

// Define user schema without the now-unnecessary `grade` field.  In
// development mode Next.js may hot-reload modules and mongoose keeps a
// cached model on `mongoose.models`.  If the schema changes (as it did when
// we removed `grade`) the old model is still returned when the module is
// re-imported, which leads to validation errors like "grade: Path `grade`
// is required" even though the source file no longer mentions `grade`.
//
// To avoid that problem we explicitly delete any existing model before
// creating a new one.  This is safe in production as well since the same
// schema will be re-used, but it ensures that the current file always
// controls the schema.

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: false,
        unique: true,
        trim: true,
        lowercase: true,
        sparse: true
    },
    password: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    },
    // XP earned today. Reset logic can be implemented later; storing the
    // date (`dailyXpDate`) makes it easy to tell when to reset on next sign-in
    // or when awarding XP.
    dailyXp: {
        type: Number,
        default: 0
    },
    dailyXpDate: {
        type: Date,
        default: null
    },
    // track activity for charting.  We store one entry per day with xp
    // earned and questions answered.  This allows the frontend to render a
    // monthly graph by fetching the last 30 entries.
    activity: [
        {
            date: { type: Date, required: true },
            xp: { type: Number, default: 0 },
            questions: { type: Number, default: 0 }
        }
    ],
    questionsSolved: {
        type: Number,
        default: 0
    },
    correctAnswers: {
        type: Number,
        default: 0
    },
    dailyChallengesDate: {
        type: Date,
        default: null
    },
    dailyChallenges: [{
        id: { type: String },
        title: { type: String },
        description: { type: String },
        xpReward: { type: Number, default: 0 },
        type: { type: String }, // 'solve' | 'correct' | 'xp'
        target: { type: Number },
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
    }],
    dayStreak: {
        type: Number,
        default: 0
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

// clear cached model if it exists so that schema changes take effect
if (mongoose.models.User) {
    delete mongoose.models.User;
}

export const User = mongoose.model('User', userSchema);
