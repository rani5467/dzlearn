const express = require('express');
const router = express.Router();
const { getMyProgress, completeLesson } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, getMyProgress);
router.post('/lesson-complete', protect, completeLesson);

module.exports = router;
