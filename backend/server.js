const express = require('express');
const cors = require('cors');
require('dotenv').config();

const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const setupDatabase = require('./scripts/setupDb');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to ALMS Backend API', status: 'running' });
});

// Diagnostic endpoint — shows which env vars are set (values masked)
app.get('/api/debug', (req, res) => {
    res.json({
        NODE_ENV:       process.env.NODE_ENV || '(not set)',
        DATABASE_URL:   process.env.DATABASE_URL ? `SET (${process.env.DATABASE_URL.substring(0, 30)}...)` : '(NOT SET)',
        DB_HOST:        process.env.DB_HOST || '(not set)',
        DB_PORT:        process.env.DB_PORT || '(not set)',
        DB_NAME:        process.env.DB_NAME || '(not set)',
        DB_USER:        process.env.DB_USER || '(not set)',
        DB_PASSWORD:    process.env.DB_PASSWORD ? 'SET' : '(not set)',
        JWT_SECRET:     process.env.JWT_SECRET ? 'SET' : '(not set)',
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'SET' : '(not set)',
    });
});

app.get('/api/seed', async (req, res) => {
    try {
        await setupDatabase();
        res.json({
            message: 'Database seeded successfully!',
            accounts: {
                student: { email: 'student@alms.com', password: 'student123' },
                teacher: { email: 'teacher@alms.com', password: 'teacher123' }
            }
        });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: 'Failed to seed database: ' + error.message, detail: error.stack });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
