const express = require('express');
const cors = require('cors');
require('dotenv').config();

const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/authRoutes');
const setupDatabase = require('./scripts/setupDb');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to ALMS Backend API' });
});

app.get('/api/seed', async (req, res) => {
    try {
        await setupDatabase();
        res.json({ message: 'Database seeded successfully! You can now use the app.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to seed database: ' + error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
