const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// Submit a quiz to trigger adaptive logic
router.post('/quiz/submit', protect, courseController.submitQuiz);

// Get student dashboard data
router.get('/dashboard', protect, courseController.getDashboard);

// Get topic details for a lesson
router.get('/topic/:id', protect, courseController.getTopic);

// Get quiz questions for a topic
router.get('/topic/:id/quiz', protect, courseController.getTopicQuiz);

module.exports = router;
