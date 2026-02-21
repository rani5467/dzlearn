const Course = require('../models/Course');
const Progress = require('../models/Progress');

// @GET /api/courses
exports.getCourses = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };

    if (category && category !== 'all') query.category = category;
    if (level && level !== 'all') query.level = { $in: [level, 'all'] };
    if (search) {
      query.$or = [
        { titleAr: { $regex: search, $options: 'i' } },
        { descriptionAr: { $regex: search, $options: 'i' } },
        { tags: { $in: [search] } }
      ];
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .select('-enrolledStudents')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      courses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الكورسات' });
  }
};

// @GET /api/courses/featured
exports.getFeatured = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true, isFeatured: true })
      .populate('instructor', 'name avatar')
      .select('-enrolledStudents')
      .limit(6);
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الكورسات المميزة' });
  }
};

// @GET /api/courses/:id
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar xp')
      .populate('lessons', 'titleAr order type duration isPublished')
      .populate('quizzes', 'titleAr type questions');

    if (!course) {
      return res.status(404).json({ success: false, message: 'الكورس غير موجود' });
    }

    // Increment views
    course.views += 1;
    await course.save({ validateBeforeSave: false });

    // Check if user enrolled
    let userProgress = null;
    if (req.user) {
      userProgress = await Progress.findOne({ user: req.user.id, course: course._id });
    }

    res.json({ success: true, course, userProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الكورس' });
  }
};

// @POST /api/courses/:id/enroll
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'الكورس غير موجود' });

    // Check if already enrolled
    const existing = await Progress.findOne({ user: req.user.id, course: course._id });
    if (existing) {
      return res.json({ success: true, message: 'أنت مسجل بالفعل في هذا الكورس', progress: existing });
    }

    // Create progress
    const progress = await Progress.create({ user: req.user.id, course: course._id });

    // Update course
    course.enrolledStudents.push(req.user.id);
    course.totalStudents += 1;
    await course.save({ validateBeforeSave: false });

    res.status(201).json({ success: true, message: 'تم التسجيل بنجاح في الكورس', progress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في التسجيل' });
  }
};

// @POST /api/courses (admin/instructor)
exports.createCourse = async (req, res) => {
  try {
    const courseData = { ...req.body, instructor: req.user.id };
    const course = await Course.create(courseData);
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في إنشاء الكورس' });
  }
};
