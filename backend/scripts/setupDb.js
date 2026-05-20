const db = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDatabase() {
    const isProd = typeof db.isProduction === 'function' ? db.isProduction() : false;
    console.log(`Setting up ${isProd ? 'PostgreSQL' : 'SQLite'} Database...`);

    const pkType = isProd ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    const cascade = isProd ? 'CASCADE' : '';

    try {
        // Drop all tables in correct dependency order
        await db.query(`DROP TABLE IF EXISTS ProgressTracking ${cascade}`);
        await db.query(`DROP TABLE IF EXISTS QuizAttempts ${cascade}`);
        await db.query(`DROP TABLE IF EXISTS Quizzes ${cascade}`);
        await db.query(`DROP TABLE IF EXISTS Topics ${cascade}`);
        await db.query(`DROP TABLE IF EXISTS Subjects ${cascade}`);
        await db.query(`DROP TABLE IF EXISTS Users ${cascade}`);

        console.log('Old tables dropped. Recreating...');

        // Users Table
        await db.query(`
            CREATE TABLE Users (
                id ${pkType},
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student'
            )
        `);

        // Subjects Table
        await db.query(`
            CREATE TABLE Subjects (
                id ${pkType},
                name TEXT NOT NULL
            )
        `);

        // Topics Table
        await db.query(`
            CREATE TABLE Topics (
                id ${pkType},
                subject_id INTEGER NOT NULL REFERENCES Subjects(id),
                order_index INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT
            )
        `);

        // Quizzes Table
        await db.query(`
            CREATE TABLE Quizzes (
                id ${pkType},
                topic_id INTEGER NOT NULL REFERENCES Topics(id),
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                correct_answer TEXT NOT NULL
            )
        `);

        // QuizAttempts
        await db.query(`
            CREATE TABLE QuizAttempts (
                id ${pkType},
                user_id INTEGER NOT NULL,
                topic_id INTEGER NOT NULL,
                score REAL NOT NULL,
                passed BOOLEAN NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ProgressTracking
        await db.query(`
            CREATE TABLE ProgressTracking (
                user_id INTEGER NOT NULL,
                topic_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                PRIMARY KEY (user_id, topic_id)
            )
        `);

        console.log('Tables created. Seeding data...');

        // Hash passwords
        const studentHash = await bcrypt.hash('student123', 10);
        const teacherHash = await bcrypt.hash('teacher123', 10);

        // Seed Users
        await db.query(
            `INSERT INTO Users (name, email, password_hash, role) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)`,
            ['Oluwaseun', 'student@alms.com', studentHash, 'student',
             'Admin Teacher', 'teacher@alms.com', teacherHash, 'teacher']
        );

        // Seed Subjects
        const subjectRes = await db.query(
            `INSERT INTO Subjects (name) VALUES ($1), ($2) RETURNING id`,
            ['Mathematics', 'Basic Science']
        );
        // SQLite RETURNING clause compatibility fallback
        let mathId, sciId;
        if (subjectRes.rows && subjectRes.rows.length > 0) {
            mathId = subjectRes.rows[0].id;
            sciId  = subjectRes.rows[1].id;
        } else {
            // Fallback for older SQLite versions if they don't support RETURNING
            const mathRow = await db.query("SELECT id FROM Subjects WHERE name = 'Mathematics'");
            const sciRow = await db.query("SELECT id FROM Subjects WHERE name = 'Basic Science'");
            mathId = mathRow.rows[0].id;
            sciId = sciRow.rows[0].id;
        }

        // Seed Topics
        const topicRes = await db.query(
            `INSERT INTO Topics (subject_id, order_index, title, content) VALUES
              ($1, 1, $2, $3),
              ($4, 2, $5, $6),
              ($7, 1, $8, $9),
              ($10, 2, $11, $12)
             RETURNING id`,
            [
                mathId,
                'Algebra Fundamentals',
                'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. In elementary algebra, those symbols represent quantities without fixed values, known as variables. Algebra allows us to write formulas and equations, solve problems, and understand the relationship between quantities. Key concepts include variables (like x and y), constants, expressions, and equations. For example, in the equation 2x + 5 = 11, we can solve for x by isolating it: subtract 5 from both sides to get 2x = 6, then divide by 2 to get x = 3.',
                mathId,
                'Linear Equations',
                'A linear equation is an equation between two variables that gives a straight line when plotted on a graph. The general form is y = mx + b, where m is the slope and b is the y-intercept. The slope tells us how steep the line is — a higher slope means a steeper line. The y-intercept is where the line crosses the y-axis. To solve a linear equation like 3x + 6 = 15, subtract 6 from both sides to get 3x = 9, then divide by 3 to find x = 3. Linear equations are used in everyday life, from calculating costs to measuring distances.',
                sciId,
                'Photosynthesis',
                'Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy (usually from the sun) into chemical energy stored in glucose. The overall equation is: 6CO2 + 6H2O + light energy -> C6H12O6 + 6O2. This process occurs primarily in the chloroplasts of plant cells, which contain a green pigment called chlorophyll. Photosynthesis has two main stages: the light-dependent reactions (which capture solar energy and produce ATP) and the Calvin cycle (which uses that energy to fix CO2 into glucose). Photosynthesis is critical for life on Earth as it produces the oxygen we breathe.',
                sciId,
                'Cellular Respiration',
                'Cellular respiration is the process by which cells break down glucose to release energy in the form of ATP (adenosine triphosphate). The overall equation is: C6H12O6 + 6O2 -> 6CO2 + 6H2O + ATP. This process occurs in the mitochondria and has three main stages: Glycolysis (in the cytoplasm), the Krebs Cycle (in the mitochondrial matrix), and the Electron Transport Chain (on the inner mitochondrial membrane). One molecule of glucose can produce up to 36-38 ATP molecules. Cellular respiration is the reverse of photosynthesis and is how animals (and plants in the dark) get the energy they need to survive.'
            ]
        );

        let algId, linId, photoId;
        if (topicRes.rows && topicRes.rows.length > 0) {
            [algId, linId, photoId] = topicRes.rows.map(r => r.id);
        } else {
            const algRow = await db.query("SELECT id FROM Topics WHERE title = 'Algebra Fundamentals'");
            const linRow = await db.query("SELECT id FROM Topics WHERE title = 'Linear Equations'");
            const photoRow = await db.query("SELECT id FROM Topics WHERE title = 'Photosynthesis'");
            algId = algRow.rows[0].id;
            linId = linRow.rows[0].id;
            photoId = photoRow.rows[0].id;
        }

        // Seed Quizzes
        await db.query(
            `INSERT INTO Quizzes (topic_id, question, options, correct_answer) VALUES
              ($1, $2, $3, $4),
              ($5, $6, $7, $8),
              ($9, $10, $11, $12),
              ($13, $14, $15, $16)`,
            [
                algId,
                'What does the letter x represent in an algebraic equation?',
                '["A known value","An unknown variable","An operator","A constant"]',
                'An unknown variable',

                algId,
                'Simplify: 2x + 3x',
                '["5","6x","5x","5x squared"]',
                '5x',

                photoId,
                'What do plants need for photosynthesis?',
                '["Oxygen and light","Water, carbon dioxide and sunlight","Soil and water","Nitrogen and oxygen"]',
                'Water, carbon dioxide and sunlight',

                photoId,
                'What gas is released during photosynthesis?',
                '["Carbon Dioxide","Nitrogen","Oxygen","Hydrogen"]',
                'Oxygen'
            ]
        );

        // Seed Progress for student (user id=1)
        await db.query(
            `INSERT INTO ProgressTracking (user_id, topic_id, status) VALUES ($1, $2, $3), ($4, $5, $6)`,
            [1, algId, 'unlocked', 1, photoId, 'unlocked']
        );

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
