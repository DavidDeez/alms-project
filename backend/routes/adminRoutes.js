const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, isTeacher } = require('../middleware/authMiddleware');

// All admin routes require a logged-in teacher
router.use(protect, isTeacher);

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/ai-status', adminController.getAIStatus);
router.post('/ai-settings', adminController.updateAISettings);
router.post('/test-ai', adminController.testAIConnection);
router.post('/subject', adminController.createSubject);
router.post('/topic', adminController.createTopic);
router.post('/topic/:id/quiz', adminController.createQuizQuestion);
router.post('/topic/:id/generate-quiz', adminController.generateQuiz);
router.delete('/topic/:id', adminController.deleteTopic);

module.exports = router;
