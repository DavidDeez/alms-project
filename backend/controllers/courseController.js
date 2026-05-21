const db = require('../config/db');
const adaptiveEngine = require('../services/adaptiveEngine');

// Handles quiz submission
exports.submitQuiz = async (req, res) => {
    try {
        const userId = req.user.id;
        const { topicId, score } = req.body;

        if (!topicId || score === undefined) {
            return res.status(400).json({ error: 'topicId and score are required' });
        }

        const recommendation = await adaptiveEngine.evaluateQuizAndAdapt(userId, topicId, score);
        
        res.status(200).json({
            success: true,
            scoreSubmitted: score,
            recommendation: recommendation
        });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ error: 'Server error while processing quiz' });
    }
};

// Fetches user progress and topic details
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user details
        const userResult = await db.query('SELECT name FROM Users WHERE id = $1', [userId]);
        const userName = userResult.rows[0]?.name || 'Student';

        // Get subjects and calculate completion rates
        const subjectsResult = await db.query('SELECT * FROM Subjects', []);
        let subjects = [];

        for (const subject of subjectsResult.rows) {
            const topicsResult = await db.query('SELECT id FROM Topics WHERE subject_id = $1', [subject.id]);
            const totalTopics = topicsResult.rows.length;
            
            if (totalTopics === 0) continue;

            let completedTopics = 0;
            for (const topic of topicsResult.rows) {
                const progressResult = await db.query(
                    'SELECT status FROM ProgressTracking WHERE user_id = $1 AND topic_id = $2',
                    [userId, topic.id]
                );
                if (progressResult.rows.length > 0 && progressResult.rows[0].status === 'completed') {
                    completedTopics++;
                }
            }

            subjects.push({
                id: subject.id,
                name: subject.name,
                completionRate: Math.round((completedTopics / totalTopics) * 100)
            });
        }

        // Get current "unlocked" but not completed topics
        const activeTopicsResult = await db.query(`
            SELECT t.id, t.title, s.name as subject_name, pt.status
            FROM ProgressTracking pt
            JOIN Topics t ON pt.topic_id = t.id
            JOIN Subjects s ON t.subject_id = s.id
            WHERE pt.user_id = $1 AND pt.status = 'unlocked'
        `, [userId]);

        const activeTopics = [];
        for (const topic of activeTopicsResult.rows) {
            const attemptResult = await db.query(`
                SELECT score FROM QuizAttempts 
                WHERE user_id = $1 AND topic_id = $2 
                ORDER BY created_at DESC LIMIT 1
            `, [userId, topic.id]);

            let lastScore = null;
            if (attemptResult.rows.length > 0) {
                lastScore = attemptResult.rows[0].score;
            }

            activeTopics.push({
                id: topic.id,
                title: topic.title,
                subject: topic.subject_name,
                lastScore: lastScore,
                needsReview: lastScore !== null && lastScore < 65
            });
        }

        // Get stats
        const attemptsResult = await db.query(
            'SELECT AVG(score) as avg_score, COUNT(*) as total_attempts FROM QuizAttempts WHERE user_id = $1',
            [userId]
        );
        const avgScore = Math.round(attemptsResult.rows[0]?.avg_score || 0);
        const totalAttempts = parseInt(attemptsResult.rows[0]?.total_attempts || 0);

        const completedResult = await db.query(
            "SELECT COUNT(*) as count FROM ProgressTracking WHERE user_id = $1 AND status = 'completed'",
            [userId]
        );
        const completedTopics = parseInt(completedResult.rows[0]?.count || 0);

        // Fetch all topics with progress status for mapping to the NERDC curriculum
        const allTopicsResult = await db.query(`
            SELECT t.id, t.title, t.subject_id, t.order_index, s.name as subject_name,
                   COALESCE(pt.status, 'locked') as progress_status
            FROM Topics t
            JOIN Subjects s ON t.subject_id = s.id
            LEFT JOIN ProgressTracking pt ON pt.topic_id = t.id AND pt.user_id = $1
            ORDER BY t.subject_id, t.order_index
        `, [userId]);

        res.json({
            userName,
            subjects,
            activeTopics,
            allTopics: allTopicsResult.rows,
            stats: { avgScore, totalAttempts, completedTopics }
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const topicResult = await db.query('SELECT * FROM Topics WHERE id = $1', [id]);
        
        if (topicResult.rows.length === 0) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        
        res.json(topicResult.rows[0]);
    } catch (error) {
        console.error('Error fetching topic:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getTopicQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const quizResult = await db.query(
            'SELECT id, question, options, correct_answer FROM Quizzes WHERE topic_id = $1',
            [id]
        );
        
        const questions = quizResult.rows.map(q => ({
            id: q.id,
            question: q.question,
            options: JSON.parse(q.options),
            correct_answer: q.correct_answer
        }));

        res.json({ questions });
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
