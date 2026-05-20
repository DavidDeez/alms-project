const db = require('../config/db');
const adaptiveEngine = require('../services/adaptiveEngine');

// Handles quiz submission
exports.submitQuiz = async (req, res) => {
    try {
        const userId = req.body.userId || 1; 
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
        const userId = 1; // Dummy user ID
        
        // Get user details
        const userResult = await db.query('SELECT name FROM Users WHERE id = ?', [userId]);
        const userName = userResult.rows[0]?.name || "Student";

        // Get subjects and calculate completion rates
        const subjectsResult = await db.query('SELECT * FROM Subjects', []);
        let subjects = [];

        for (const subject of subjectsResult.rows) {
            const topicsResult = await db.query('SELECT id FROM Topics WHERE subject_id = ?', [subject.id]);
            const totalTopics = topicsResult.rows.length;
            
            if (totalTopics === 0) continue;

            let completedTopics = 0;
            for (const topic of topicsResult.rows) {
                const progressResult = await db.query('SELECT status FROM ProgressTracking WHERE user_id = ? AND topic_id = ?', [userId, topic.id]);
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

        // Get current "unlocked" but not completed topics (Needs Review / Continue)
        const activeTopicsResult = await db.query(`
            SELECT t.id, t.title, s.name as subject_name, pt.status
            FROM ProgressTracking pt
            JOIN Topics t ON pt.topic_id = t.id
            JOIN Subjects s ON t.subject_id = s.id
            WHERE pt.user_id = ? AND pt.status = 'unlocked'
        `, [userId]);

        const activeTopics = [];
        for (const topic of activeTopicsResult.rows) {
            // Check if there's a previous failed quiz attempt
            const attemptResult = await db.query(`
                SELECT score FROM QuizAttempts 
                WHERE user_id = ? AND topic_id = ? 
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

        res.json({
            userName,
            subjects,
            activeTopics
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const topicResult = await db.query('SELECT * FROM Topics WHERE id = ?', [id]);
        
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
        const quizResult = await db.query('SELECT id, question, options, correct_answer FROM Quizzes WHERE topic_id = ?', [id]);
        
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
