// simple seeder for quiz questions
import mongoose from 'mongoose';
import { Question } from '../src/app/api/models/Question.js';

const uri = 'mongodb+srv://umidjoon:hkx33b@28quiz.bevrzgr.mongodb.net/?appName=28quiz';

async function main() {
    await mongoose.connect(uri);
    console.log('connected');

    const samples = [
        {
            category: 'JavaScript',
            difficulty: 'Medium',
            question: 'What is the output of `typeof NaN`?',
            options: ['"number"', '"NaN"', '"object"', '"undefined"'],
            correctAnswer: 0,
            xpReward: 20,
            time: 30
        },
        {
            category: 'JavaScript',
            difficulty: 'Easy',
            question: 'Which method converts JSON to an object?',
            options: ['JSON.stringify', 'JSON.parse', 'JSON.object', 'JSON.toObject'],
            correctAnswer: 1,
            xpReward: 10,
            time: 20
        },
        {
            category: 'Python',
            difficulty: 'Easy',
            question: 'What keyword is used to define a function in Python?',
            options: ['func', 'def', 'function', 'lambda'],
            correctAnswer: 1,
            xpReward: 15,
            time: 25
        },
        {
            category: 'Java',
            difficulty: 'Easy',
            question: 'What is the entry point of a Java application?',
            options: ['main()', 'start()', 'run()', 'init()'],
            correctAnswer: 0,
            xpReward: 15,
            time: 25
        },
        {
            category: 'Java',
            difficulty: 'Medium',
            question: 'Which keyword is used to create an object in Java?',
            options: ['create', 'new', 'object', 'make'],
            correctAnswer: 1,
            xpReward: 20,
            time: 30
        },
        {
            category: 'Java',
            difficulty: 'Hard',
            question: 'What is the output of 5 + 3 * 2 in Java?',
            options: ['16', '11', '13', '10'],
            correctAnswer: 1,
            xpReward: 25,
            time: 35
        }
    ];

    const created = await Question.insertMany(samples);
    console.log('inserted', created.length);
    mongoose.disconnect();
}

main().catch(console.error);
