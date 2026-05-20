const db = require('../config/db');

// GET /api/admin/dashboard
exports.getAdminDashboard = async (req, res) => {
    try {
        const subjectsResult = await db.query('SELECT * FROM Subjects ORDER BY id', []);
        const subjects = [];

        for (const subject of subjectsResult.rows) {
            const topicsResult = await db.query(
                'SELECT t.id, t.title, t.order_index, (SELECT COUNT(*) FROM Quizzes q WHERE q.topic_id = t.id) as quiz_count FROM Topics t WHERE t.subject_id = $1 ORDER BY t.order_index',
                [subject.id]
            );
            subjects.push({
                id: subject.id,
                name: subject.name,
                topics: topicsResult.rows
            });
        }

        // Total student count
        const userCountResult = await db.query("SELECT COUNT(*) as count FROM Users WHERE role = 'student'", []);
        const studentCount = parseInt(userCountResult.rows[0]?.count || 0);

        res.json({ subjects, studentCount });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/admin/subject
exports.createSubject = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Subject name is required' });

        await db.query('INSERT INTO Subjects (name) VALUES ($1)', [name]);
        res.status(201).json({ message: 'Subject created successfully' });
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/admin/topic
exports.createTopic = async (req, res) => {
    try {
        const { subject_id, title, content } = req.body;
        if (!subject_id || !title) {
            return res.status(400).json({ error: 'subject_id and title are required' });
        }

        // Get the next order_index for this subject
        const orderResult = await db.query(
            'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM Topics WHERE subject_id = $1',
            [subject_id]
        );
        const nextOrder = orderResult.rows[0]?.next_order || 1;

        await db.query(
            'INSERT INTO Topics (subject_id, order_index, title, content) VALUES ($1, $2, $3, $4)',
            [subject_id, nextOrder, title, content || '']
        );

        res.status(201).json({ message: 'Topic created successfully' });
    } catch (error) {
        console.error('Create topic error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/admin/topic/:id/quiz — Manual quiz question creation
exports.createQuizQuestion = async (req, res) => {
    try {
        const { id: topicId } = req.params;
        const { question, options, correct_answer } = req.body;

        if (!question || !options || !correct_answer) {
            return res.status(400).json({ error: 'question, options (array), and correct_answer are required' });
        }

        await db.query(
            'INSERT INTO Quizzes (topic_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)',
            [topicId, question, JSON.stringify(options), correct_answer]
        );

        res.status(201).json({ message: 'Quiz question added successfully' });
    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE /api/admin/topic/:id
exports.deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM Quizzes WHERE topic_id = $1', [id]);
        await db.query('DELETE FROM ProgressTracking WHERE topic_id = $1', [id]);
        await db.query('DELETE FROM QuizAttempts WHERE topic_id = $1', [id]);
        await db.query('DELETE FROM Topics WHERE id = $1', [id]);
        res.json({ message: 'Topic deleted' });
    } catch (error) {
        console.error('Delete topic error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
