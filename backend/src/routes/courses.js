const express = require('express');
const router = express.Router();
const { getCourses, getFeatured, getCourse, enrollCourse, createCourse } = require('../controllers/courseController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getCourses);
router.get('/featured', getFeatured);
router.get('/:id', optionalAuth, getCourse);
router.post('/:id/enroll', protect, enrollCourse);
router.post('/', protect, authorize('admin', 'instructor'), createCourse);

module.exports = router;
