const db = require('../config/db');

exports.evaluateQuizAndAdapt = async (userId, topicId, score) => {
    const PASS_THRESHOLD = 65.0;
    const passed = score >= PASS_THRESHOLD;

    // 1. Record the attempt
    await db.query(
        `INSERT INTO QuizAttempts (user_id, topic_id, score, passed) VALUES ($1, $2, $3, $4)`,
        [userId, topicId, score, passed]
    );

    let recommendation = {};

    if (passed) {
        // --- MASTERY ACHIEVED ---
        // Mark current topic as completed
        await db.query(
            `UPDATE ProgressTracking SET status = 'completed' WHERE user_id = $1 AND topic_id = $2`,
            [userId, topicId]
        );

        // Find the next topic in the sequence (same subject, next order_index)
        const currentTopicResult = await db.query(`SELECT subject_id, order_index FROM Topics WHERE id = $1`, [topicId]);
        
        if (currentTopicResult.rows.length === 0) {
            return { error: 'Topic not found' };
        }
        
        const currentTopic = currentTopicResult.rows[0];

        const nextTopicResult = await db.query(
            `SELECT id, title FROM Topics WHERE subject_id = $1 AND order_index > $2 ORDER BY order_index ASC LIMIT 1`,
            [currentTopic.subject_id, currentTopic.order_index]
        );

        if (nextTopicResult.rows.length > 0) {
            // Unlock the next topic
            const nextTopicId = nextTopicResult.rows[0].id;
            await db.query(
                `INSERT INTO ProgressTracking (user_id, topic_id, status) VALUES ($1, $2, 'unlocked')
                 ON CONFLICT (user_id, topic_id) DO UPDATE SET status = 'unlocked'`,
                [userId, nextTopicId]
            );
            recommendation = {
                action: 'advance',
                message: 'Great job! You have mastered this topic.',
                nextTopicId: nextTopicId,
                nextTopicTitle: nextTopicResult.rows[0].title
            };
        } else {
            recommendation = { action: 'finish', message: 'Congratulations! You have completed the subject.' };
        }

    } else {
        // --- REQUIRES REVISION ---
        // Do not update status to completed. Ensure it stays 'unlocked' for retake.
        recommendation = {
            action: 'revise',
            message: 'You scored below 65%. Please review the recommended materials before retaking the quiz.',
            retryTopicId: topicId,
            suggestedMaterials: [
                { type: 'video', url: `/remedial-videos/${topicId}`, title: 'Simplified Video Explanation' },
                { type: 'notes', url: `/simplified-notes/${topicId}`, title: 'Key Concepts Summary' }
            ]
        };
    }

    return recommendation;
};
