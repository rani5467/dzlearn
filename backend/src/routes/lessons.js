const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const { protect, authorize } = require('../middleware/auth');

router.get('/course/:courseId', async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId, isPublished: true }).sort('order');
    res.json({ success: true, lessons });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الدروس' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course', 'titleAr');
    if (!lesson) return res.status(404).json({ success: false, message: 'الدرس غير موجود' });
    lesson.views += 1;
    await lesson.save({ validateBeforeSave: false });
    res.json({ success: true, lesson });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الدرس' });
  }
});

router.post('/', protect, authorize('admin', 'instructor'), async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ success: true, lesson });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في إنشاء الدرس' });
  }
});

module.exports = router;
