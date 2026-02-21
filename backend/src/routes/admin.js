const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

const admin = [protect, authorize('admin')];
const adminOrInstructor = [protect, authorize('admin', 'instructor')];

router.get('/stats', admin, ctrl.getDashboardStats);
router.get('/users', admin, ctrl.getUsers);
router.put('/users/:id', admin, ctrl.updateUser);
router.delete('/users/:id', admin, ctrl.deleteUser);
router.get('/courses', adminOrInstructor, ctrl.getAllCourses);
router.post('/courses', adminOrInstructor, ctrl.createCourse);
router.put('/courses/:id', adminOrInstructor, ctrl.updateCourse);
router.delete('/courses/:id', admin, ctrl.deleteCourse);
router.get('/lessons', adminOrInstructor, ctrl.getLessons);
router.post('/lessons', adminOrInstructor, ctrl.createLesson);
router.put('/lessons/:id', adminOrInstructor, ctrl.updateLesson);
router.delete('/lessons/:id', adminOrInstructor, ctrl.deleteLesson);
router.get('/quizzes', adminOrInstructor, ctrl.getAllQuizzes);
router.post('/quizzes', adminOrInstructor, ctrl.createQuiz);
router.put('/quizzes/:id', adminOrInstructor, ctrl.updateQuiz);
router.delete('/quizzes/:id', adminOrInstructor, ctrl.deleteQuiz);
router.get('/rewards', admin, ctrl.getRewards);
router.post('/rewards', admin, ctrl.createReward);
router.put('/rewards/:id', admin, ctrl.updateReward);
router.delete('/rewards/:id', admin, ctrl.deleteReward);
router.post('/rewards/:id/grant', admin, ctrl.grantRewardToUser);

module.exports = router;
