const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Submit a quiz to trigger adaptive logic
router.post('/quiz/submit', courseController.submitQuiz);

// Get student dashboard data
router.get('/dashboard', courseController.getDashboard);

// Get topic details for a lesson
router.get('/topic/:id', courseController.getTopic);

// Get quiz questions for a topic
router.get('/topic/:id/quiz', courseController.getTopicQuiz);

module.exports = router;
