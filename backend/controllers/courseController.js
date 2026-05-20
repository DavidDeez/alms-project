const adaptiveEngine = require('../services/adaptiveEngine');

// Handles quiz submission
exports.submitQuiz = async (req, res) => {
    try {
        // In a real app, userId comes from JWT auth middleware (req.userId)
        // We use a dummy ID here for demonstration purposes
        const userId = req.body.userId || 1; 
        const { topicId, score } = req.body;

        if (!topicId || score === undefined) {
            return res.status(400).json({ error: 'topicId and score are required' });
        }

        // Run the adaptive logic
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

// Dummy dashboard data for the frontend to render initially
exports.getDashboard = async (req, res) => {
    // In production, this data is dynamically fetched from Postgres
    res.json({
        userName: "Oluwaseun",
        recommendedAction: "revise", // or "advance"
        currentTopicTitle: "Photosynthesis",
        nextTopicTitle: "Cellular Respiration",
        subjects: [
            { id: 1, name: "Mathematics", completionRate: 45 },
            { id: 2, name: "Basic Science", completionRate: 60 },
            { id: 3, name: "English Language", completionRate: 85 }
        ]
    });
};
