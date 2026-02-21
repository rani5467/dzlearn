const express = require('express');
const router = express.Router();
const { getQuizzes, getQuiz, submitQuiz, createQuiz } = require('../controllers/quizController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', getQuizzes);
router.get('/:id', getQuiz);
router.post('/:id/submit', optionalAuth, submitQuiz);
router.post('/', protect, authorize('admin', 'instructor'), createQuiz);

module.exports = router;
