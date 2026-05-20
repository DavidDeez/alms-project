const db = require('../config/db');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;
const autoInc = isProduction ? 'SERIAL' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
const autoIncNoType = isProduction ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';

async function setupDatabase() {
    console.log(`Setting up ${isProduction ? 'PostgreSQL' : 'SQLite'} Database...`);

    try {
        // Users Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id ${autoIncNoType},
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL
            )
        `);

        // Subjects Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS Subjects (
                id ${autoIncNoType},
                name TEXT NOT NULL
            )
        `);

        // Topics Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS Topics (
                id ${autoIncNoType},
                subject_id INTEGER NOT NULL,
                order_index INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT,
                FOREIGN KEY (subject_id) REFERENCES Subjects(id)
            )
        `);

        // Quizzes Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS Quizzes (
                id ${autoIncNoType},
                topic_id INTEGER NOT NULL,
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                correct_answer TEXT NOT NULL,
                FOREIGN KEY (topic_id) REFERENCES Topics(id)
            )
        `);

        // QuizAttempts
        await db.query(`
            CREATE TABLE IF NOT EXISTS QuizAttempts (
                id ${autoIncNoType},
                user_id INTEGER NOT NULL,
                topic_id INTEGER NOT NULL,
                score REAL NOT NULL,
                passed BOOLEAN NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ProgressTracking
        await db.query(`
            CREATE TABLE IF NOT EXISTS ProgressTracking (
                user_id INTEGER NOT NULL,
                topic_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                PRIMARY KEY (user_id, topic_id)
            )
        `);

        console.log('Tables created successfully. Seeding data...');

        // Clear existing data for fresh seed
        await db.query(`DELETE FROM Quizzes`);
        await db.query(`DELETE FROM Topics`);
        await db.query(`DELETE FROM Subjects`);
        await db.query(`DELETE FROM Users`);
        await db.query(`DELETE FROM ProgressTracking`);

        // Seed Users
        await db.query(`INSERT INTO Users (id, name, email) VALUES (1, 'Oluwaseun', 'student@alms.com')`);

        // Seed Subjects
        await db.query(`INSERT INTO Subjects (id, name) VALUES (1, 'Mathematics'), (2, 'Basic Science')`);

        // Seed Topics
        await db.query(`INSERT INTO Topics (id, subject_id, order_index, title, content) VALUES 
            (1, 1, 1, 'Algebra Fundamentals', 'Algebra is a branch of mathematics...'),
            (2, 1, 2, 'Linear Equations', 'A linear equation is an equation...'),
            (3, 2, 1, 'Photosynthesis', 'Photosynthesis is a process used by plants...'),
            (4, 2, 2, 'Cellular Respiration', 'Cellular respiration is a set of metabolic reactions...')
        `);

        // Seed Quizzes (Options stored as JSON string)
        await db.query(`INSERT INTO Quizzes (topic_id, question, options, correct_answer) VALUES 
            (1, 'What does the letter x represent in an algebraic equation?', '["A known value", "An unknown variable", "An operator", "A constant"]', 'An unknown variable'),
            (1, 'Simplify: 2x + 3x', '["5", "6x", "5x", "5x^2"]', '5x'),
            (3, 'What do plants need for photosynthesis?', '["Oxygen and light", "Water, carbon dioxide and sunlight", "Soil and water", "Nitrogen and oxygen"]', 'Water, carbon dioxide and sunlight'),
            (3, 'What gas is released during photosynthesis?', '["Carbon Dioxide", "Nitrogen", "Oxygen", "Hydrogen"]', 'Oxygen')
        `);

        // Seed Progress
        await db.query(`INSERT INTO ProgressTracking (user_id, topic_id, status) VALUES 
            (1, 1, 'unlocked'),
            (1, 3, 'unlocked')
        `);

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error setting up database:', error);
        throw error;
    }
}

module.exports = setupDatabase;

if (require.main === module) {
    setupDatabase().then(() => process.exit(0)).catch(err => {
        console.error(err);
        process.exit(1);
    });
}
