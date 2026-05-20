const db = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

async function setupDatabase() {
    console.log(`Setting up ${isProduction ? 'PostgreSQL' : 'SQLite'} Database...`);

    try {
        // Users Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student'
            )
        `);

        // Subjects Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS Subjects (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL
            )
        `);

        // Topics Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS Topics (
                id SERIAL PRIMARY KEY,
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
                id SERIAL PRIMARY KEY,
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
                id SERIAL PRIMARY KEY,
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
        await db.query(`DELETE FROM ProgressTracking`);
        await db.query(`DELETE FROM QuizAttempts`);
        await db.query(`DELETE FROM Topics`);
        await db.query(`DELETE FROM Subjects`);
        await db.query(`DELETE FROM Users`);

        // Hash passwords
        const studentHash = await bcrypt.hash('student123', 10);
        const teacherHash = await bcrypt.hash('teacher123', 10);

        // Seed Users - reset sequence first for PostgreSQL
        if (isProduction) {
            await db.query(`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
        }
        await db.query(
            `INSERT INTO Users (name, email, password_hash, role) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)`,
            ['Oluwaseun', 'student@alms.com', studentHash, 'student',
             'Admin Teacher', 'teacher@alms.com', teacherHash, 'teacher']
        );

        // Seed Subjects
        if (isProduction) {
            await db.query(`ALTER SEQUENCE subjects_id_seq RESTART WITH 1`);
        }
        await db.query(`INSERT INTO Subjects (name) VALUES ($1), ($2)`, ['Mathematics', 'Basic Science']);

        // Seed Topics
        if (isProduction) {
            await db.query(`ALTER SEQUENCE topics_id_seq RESTART WITH 1`);
        }
        await db.query(
            `INSERT INTO Topics (subject_id, order_index, title, content) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8), ($9, $10, $11, $12), ($13, $14, $15, $16)`,
            [
                1, 1, 'Algebra Fundamentals',
                'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. In elementary algebra, those symbols represent quantities without fixed values, known as variables. Algebra allows us to write formulas and equations, solve problems, and understand the relationship between quantities. Key concepts include variables (like x and y), constants, expressions, and equations. For example, in the equation 2x + 5 = 11, we can solve for x by isolating it: subtract 5 from both sides to get 2x = 6, then divide by 2 to get x = 3.',
                1, 2, 'Linear Equations',
                'A linear equation is an equation between two variables that gives a straight line when plotted on a graph. The general form is y = mx + b, where m is the slope and b is the y-intercept. The slope tells us how steep the line is — a higher slope means a steeper line. The y-intercept is where the line crosses the y-axis. To solve a linear equation like 3x + 6 = 15, subtract 6 from both sides to get 3x = 9, then divide by 3 to find x = 3. Linear equations are used in everyday life, from calculating costs to measuring distances.',
                2, 1, 'Photosynthesis',
                'Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy (usually from the sun) into chemical energy stored in glucose. The overall equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This process occurs primarily in the chloroplasts of plant cells, which contain a green pigment called chlorophyll. Photosynthesis has two main stages: the light-dependent reactions (which capture solar energy and produce ATP) and the Calvin cycle (which uses that energy to fix CO₂ into glucose). Photosynthesis is critical for life on Earth as it produces the oxygen we breathe.',
                2, 2, 'Cellular Respiration',
                'Cellular respiration is the process by which cells break down glucose to release energy in the form of ATP (adenosine triphosphate). The overall equation is: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP. This process occurs in the mitochondria and has three main stages: Glycolysis (in the cytoplasm), the Krebs Cycle (in the mitochondrial matrix), and the Electron Transport Chain (on the inner mitochondrial membrane). One molecule of glucose can produce up to 36-38 ATP molecules. Cellular respiration is the reverse of photosynthesis and is how animals (and plants in the dark) get the energy they need to survive.'
            ]
        );

        // Seed Quizzes
        if (isProduction) {
            await db.query(`ALTER SEQUENCE quizzes_id_seq RESTART WITH 1`);
        }
        await db.query(
            `INSERT INTO Quizzes (topic_id, question, options, correct_answer) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8), ($9, $10, $11, $12), ($13, $14, $15, $16)`,
            [
                1, 'What does the letter x represent in an algebraic equation?',
                '["A known value", "An unknown variable", "An operator", "A constant"]', 'An unknown variable',
                1, 'Simplify: 2x + 3x',
                '["5", "6x", "5x", "5x²"]', '5x',
                3, 'What do plants need for photosynthesis?',
                '["Oxygen and light", "Water, carbon dioxide and sunlight", "Soil and water", "Nitrogen and oxygen"]', 'Water, carbon dioxide and sunlight',
                3, 'What gas is released during photosynthesis?',
                '["Carbon Dioxide", "Nitrogen", "Oxygen", "Hydrogen"]', 'Oxygen'
            ]
        );

        // Seed Progress for student (user id=1)
        await db.query(
            `INSERT INTO ProgressTracking (user_id, topic_id, status) VALUES ($1, $2, $3), ($4, $5, $6)`,
            [1, 1, 'unlocked', 1, 3, 'unlocked']
        );

        console.log('Database seeded successfully!');
        console.log('Student login: student@alms.com / student123');
        console.log('Teacher login: teacher@alms.com / teacher123');
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
