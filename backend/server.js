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
        res.status(500).json({ error: 'Failed to seed database: ' + error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
