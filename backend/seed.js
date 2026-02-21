const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Lesson = require('./src/models/Lesson');
const Quiz = require('./src/models/Quiz');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dzlearn';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ متصل بقاعدة البيانات');

  // Clear
  await Promise.all([
    User.deleteMany(),
    Course.deleteMany(),
    Lesson.deleteMany(),
    Quiz.deleteMany()
  ]);
  console.log('🗑️  تم مسح البيانات القديمة');

  // Create admin
  const admin = await User.create({
    name: 'مدير المنصة',
    email: process.env.ADMIN_EMAIL || 'admin@dzlearn.dz',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: 'admin',
    isVerified: true,
    xp: 9999
  });

  // Create instructor
  const instructor = await User.create({
    name: 'أستاذ عمر بن علي',
    email: 'instructor@dzlearn.dz',
    password: 'instructor123',
    role: 'instructor',
    wilaya: 'الجزائر',
    isVerified: true,
    xp: 2500
  });

  // Create sample students
  const students = await User.insertMany([
    { name: 'ياسين خالد', email: 'yassin@test.dz', password: await bcrypt.hash('test123', 10), wilaya: 'الجزائر', level: 'bac', xp: 850, streak: 12, coursesCompleted: 3, role: 'student' },
    { name: 'أميرة بوزيد', email: 'amira@test.dz', password: await bcrypt.hash('test123', 10), wilaya: 'وهران', level: 'bac', xp: 720, streak: 8, coursesCompleted: 2, role: 'student' },
    { name: 'بلال مصطفى', email: 'bilal@test.dz', password: await bcrypt.hash('test123', 10), wilaya: 'قسنطينة', level: 'bac', xp: 650, streak: 5, coursesCompleted: 2, role: 'student' },
    { name: 'نادية سعيدي', email: 'nadia@test.dz', password: await bcrypt.hash('test123', 10), wilaya: 'عنابة', level: 'bac', xp: 580, streak: 4, coursesCompleted: 1, role: 'student' },
    { name: 'عمر تواتي', email: 'omar@test.dz', password: await bcrypt.hash('test123', 10), wilaya: 'بشار', level: 'bac', xp: 420, streak: 3, coursesCompleted: 1, role: 'student' },
  ]);

  // Create courses
  const mathCourse = await Course.create({
    title: 'Mathematics BAC',
    titleAr: 'الرياضيات - بكالوريا',
    description: 'Complete mathematics course for BAC',
    descriptionAr: 'دورة شاملة في الرياضيات لاجتياز امتحان البكالوريا بتفوق. تغطي جميع المحاور من دوال وتفاضل وتكامل وإحصاء.',
    category: 'math',
    level: 'bac_science',
    instructor: instructor._id,
    totalLessons: 4,
    isFeatured: true,
    isPublished: true,
    totalStudents: 1240,
    rating: 4.8,
    ratingsCount: 235,
    tags: ['بكالوريا', 'رياضيات', 'تفاضل', 'تكامل'],
    xpReward: 100
  });

  const physicsCourse = await Course.create({
    title: 'Physics BAC',
    titleAr: 'الفيزياء - بكالوريا',
    description: 'Complete physics course for BAC',
    descriptionAr: 'دورة متكاملة في الفيزياء للباكالوريا: الميكانيك، الكهرباء، البصريات، والفيزياء الحديثة.',
    category: 'physics',
    level: 'bac_science',
    instructor: instructor._id,
    totalLessons: 3,
    isFeatured: true,
    isPublished: true,
    totalStudents: 980,
    rating: 4.7,
    ratingsCount: 189,
    tags: ['بكالوريا', 'فيزياء', 'ميكانيك', 'كهرباء'],
    xpReward: 100
  });

  const arabicCourse = await Course.create({
    title: 'Arabic Literature BAC',
    titleAr: 'اللغة العربية وآدابها - بكالوريا',
    description: 'Arabic language and literature',
    descriptionAr: 'دورة متخصصة في اللغة العربية وآدابها: النحو والصرف، البلاغة، النصوص الأدبية، والتعبير الكتابي.',
    category: 'arabic',
    level: 'bac_literature',
    instructor: instructor._id,
    totalLessons: 3,
    isFeatured: true,
    isPublished: true,
    totalStudents: 750,
    rating: 4.6,
    ratingsCount: 142,
    tags: ['بكالوريا', 'عربية', 'أدب', 'نحو'],
    xpReward: 80
  });

  const frenchCourse = await Course.create({
    title: 'French BAC',
    titleAr: 'اللغة الفرنسية - بكالوريا',
    description: 'French language for BAC',
    descriptionAr: 'دورة كاملة في اللغة الفرنسية للباكالوريا: القواعد، النصوص، التعبير الكتابي والشفوي.',
    category: 'french',
    level: 'bac_science',
    instructor: instructor._id,
    totalLessons: 3,
    isPublished: true,
    totalStudents: 620,
    rating: 4.5,
    ratingsCount: 98,
    tags: ['بكالوريا', 'فرنسية', 'قواعد'],
    xpReward: 80
  });

  const historyCourse = await Course.create({
    title: 'History BAC',
    titleAr: 'التاريخ والجغرافيا - بكالوريا',
    description: 'History for BAC',
    descriptionAr: 'دورة في التاريخ والجغرافيا للباكالوريا: تاريخ الجزائر، التاريخ المعاصر، الجغرافيا البشرية والطبيعية.',
    category: 'history',
    level: 'bac_literature',
    instructor: instructor._id,
    totalLessons: 3,
    isPublished: true,
    totalStudents: 480,
    rating: 4.4,
    ratingsCount: 77,
    tags: ['بكالوريا', 'تاريخ', 'جغرافيا', 'جزائر'],
    xpReward: 70
  });

  // Create Lessons for Math
  const lesson1 = await Lesson.create({
    title: 'Derivatives Introduction',
    titleAr: 'مدخل إلى حساب المشتقات',
    content: `<h2>حساب المشتقات</h2>
<p>المشتقة هي قياس لمعدل التغيير الفوري لدالة. إذا كانت f(x) دالة، فإن مشتقتها f'(x) تمثل ميل المماس للمنحنى عند أي نقطة.</p>

<h3>القواعد الأساسية للمشتقات</h3>
<ul>
  <li><strong>مشتقة الثابت:</strong> إذا كانت f(x) = c فإن f'(x) = 0</li>
  <li><strong>قاعدة القوة:</strong> إذا كانت f(x) = xⁿ فإن f'(x) = n·xⁿ⁻¹</li>
  <li><strong>قاعدة الجمع:</strong> (f + g)' = f' + g'</li>
  <li><strong>قاعدة الضرب:</strong> (f·g)' = f'·g + f·g'</li>
  <li><strong>قاعدة القسمة:</strong> (f/g)' = (f'·g - f·g') / g²</li>
</ul>

<h3>مثال تطبيقي</h3>
<p>احسب مشتقة الدالة: f(x) = 3x³ - 6x² + 2x - 1</p>
<p>الحل: f'(x) = 9x² - 12x + 2</p>

<div class="example-box">
  <h4>تمرين للتطبيق</h4>
  <p>احسب مشتقة: g(x) = x⁴ - 2x³ + 5x - 7</p>
  <p>الجواب: g'(x) = 4x³ - 6x² + 5</p>
</div>`,
    course: mathCourse._id,
    order: 1,
    type: 'article',
    duration: 15,
    isPublished: true,
    xpReward: 10
  });

  const lesson2 = await Lesson.create({
    title: 'Integrals',
    titleAr: 'حساب التكاملات',
    content: `<h2>حساب التكاملات</h2>
<p>التكامل هو العملية العكسية للاشتقاق. يُستخدم لحساب المساحات تحت المنحنيات والأحجام.</p>
<h3>قواعد التكامل الأساسية</h3>
<ul>
  <li>∫ xⁿ dx = xⁿ⁺¹/(n+1) + C حيث n ≠ -1</li>
  <li>∫ e^x dx = e^x + C</li>
  <li>∫ 1/x dx = ln|x| + C</li>
</ul>
<h3>التكامل المحدود</h3>
<p>∫ₐᵇ f(x)dx = F(b) - F(a) حيث F هي الدالة الأصلية</p>`,
    course: mathCourse._id,
    order: 2,
    type: 'article',
    duration: 20,
    isPublished: true,
    xpReward: 10
  });

  // Update course with lesson IDs
  mathCourse.lessons = [lesson1._id, lesson2._id];
  await mathCourse.save();

  // Create Quizzes
  const mathQuiz = await Quiz.create({
    title: 'Mathematics Quiz',
    titleAr: 'اختبار الرياضيات - المشتقات والتكاملات',
    description: 'اختبر معلوماتك في الرياضيات',
    subject: 'math',
    level: 'bac_science',
    type: 'practice',
    timeLimit: 20,
    passingScore: 60,
    xpReward: 30,
    isPublished: true,
    questions: [
      {
        text: 'ما مشتقة الدالة f(x) = x³ - 2x + 1؟',
        options: [
          { text: 'f\'(x) = 3x² - 2', isCorrect: true },
          { text: 'f\'(x) = 3x² + 1', isCorrect: false },
          { text: 'f\'(x) = x² - 2', isCorrect: false },
          { text: 'f\'(x) = 3x - 2', isCorrect: false }
        ],
        explanation: 'نطبق قاعدة القوة: مشتقة x³ = 3x²، ومشتقة -2x = -2، ومشتقة الثابت = 0',
        difficulty: 'easy',
        points: 10
      },
      {
        text: 'ما قيمة ∫₀² x² dx؟',
        options: [
          { text: '8/3', isCorrect: true },
          { text: '4', isCorrect: false },
          { text: '2', isCorrect: false },
          { text: '16/3', isCorrect: false }
        ],
        explanation: '∫x²dx = x³/3. نعوض الحدود: (2³/3) - (0³/3) = 8/3',
        difficulty: 'medium',
        points: 10
      },
      {
        text: 'المنبت الفعلي للدالة f(x) = (x-2)(x+3) هو؟',
        options: [
          { text: 'x = 2 أو x = -3', isCorrect: true },
          { text: 'x = -2 أو x = 3', isCorrect: false },
          { text: 'x = 1', isCorrect: false },
          { text: 'لا يوجد منبت', isCorrect: false }
        ],
        explanation: 'الدالة تنعدم عندما f(x) = 0، أي (x-2) = 0 أو (x+3) = 0، فتكون x = 2 أو x = -3',
        difficulty: 'easy',
        points: 10
      },
      {
        text: 'المميز Δ لمعادلة 2x² - 3x + 1 = 0 يساوي؟',
        options: [
          { text: '1', isCorrect: true },
          { text: '7', isCorrect: false },
          { text: '-1', isCorrect: false },
          { text: '9', isCorrect: false }
        ],
        explanation: 'Δ = b² - 4ac = (-3)² - 4(2)(1) = 9 - 8 = 1',
        difficulty: 'medium',
        points: 10
      },
      {
        text: 'إذا كانت f(x) = sin(x)، فإن f\'(x) تساوي؟',
        options: [
          { text: 'cos(x)', isCorrect: true },
          { text: '-sin(x)', isCorrect: false },
          { text: '-cos(x)', isCorrect: false },
          { text: 'tan(x)', isCorrect: false }
        ],
        explanation: 'مشتقة sin(x) = cos(x) وهي من القواعد الأساسية للاشتقاق.',
        difficulty: 'medium',
        points: 10
      }
    ]
  });

  const physicsQuiz = await Quiz.create({
    title: 'Physics Quiz',
    titleAr: 'اختبار الفيزياء - الميكانيك والكهرباء',
    subject: 'physics',
    level: 'bac_science',
    type: 'practice',
    timeLimit: 20,
    passingScore: 60,
    xpReward: 30,
    isPublished: true,
    questions: [
      {
        text: 'ما وحدة قياس القوة في النظام الدولي؟',
        options: [
          { text: 'نيوتن (N)', isCorrect: true },
          { text: 'جول (J)', isCorrect: false },
          { text: 'باسكال (Pa)', isCorrect: false },
          { text: 'واط (W)', isCorrect: false }
        ],
        explanation: 'القوة تُقاس بالنيوتن (N). 1N = 1 kg·m/s²',
        difficulty: 'easy',
        points: 10
      },
      {
        text: 'قانون أوم هو:',
        options: [
          { text: 'U = R × I', isCorrect: true },
          { text: 'P = U × R', isCorrect: false },
          { text: 'I = R + U', isCorrect: false },
          { text: 'R = U + I', isCorrect: false }
        ],
        explanation: 'قانون أوم: الجهد = المقاومة × شدة التيار (U = RI)',
        difficulty: 'easy',
        points: 10
      },
      {
        text: 'سرعة الضوء في الفراغ تساوي تقريباً:',
        options: [
          { text: '3×10⁸ m/s', isCorrect: true },
          { text: '3×10⁶ m/s', isCorrect: false },
          { text: '3×10¹⁰ m/s', isCorrect: false },
          { text: '3×10⁴ m/s', isCorrect: false }
        ],
        explanation: 'سرعة الضوء c ≈ 3×10⁸ m/s (300,000 km/s) في الفراغ.',
        difficulty: 'easy',
        points: 10
      }
    ]
  });

  const arabicQuiz = await Quiz.create({
    title: 'Arabic Quiz',
    titleAr: 'اختبار اللغة العربية - النحو والصرف',
    subject: 'arabic',
    level: 'bac_literature',
    type: 'practice',
    timeLimit: 15,
    passingScore: 60,
    xpReward: 25,
    isPublished: true,
    questions: [
      {
        text: 'ما إعراب "الطالبُ" في جملة: "نجحَ الطالبُ"؟',
        options: [
          { text: 'فاعل مرفوع بالضمة', isCorrect: true },
          { text: 'مبتدأ مرفوع', isCorrect: false },
          { text: 'مفعول به منصوب', isCorrect: false },
          { text: 'خبر مرفوع', isCorrect: false }
        ],
        explanation: '"الطالبُ" فاعل للفعل "نجح"، مرفوع وعلامة رفعه الضمة الظاهرة.',
        difficulty: 'medium',
        points: 10
      },
      {
        text: 'ما نوع الجملة: "المجدُّ ينجح"؟',
        options: [
          { text: 'جملة اسمية', isCorrect: true },
          { text: 'جملة فعلية', isCorrect: false },
          { text: 'جملة فعلية مجهولة', isCorrect: false },
          { text: 'جملة إنشائية', isCorrect: false }
        ],
        explanation: 'الجملة الاسمية تبدأ باسم (المجدُّ). مبتدأ + خبر.',
        difficulty: 'easy',
        points: 10
      }
    ]
  });

  console.log('✅ تم إنشاء قاعدة البيانات بنجاح');
  console.log(`👤 المدير: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  console.log(`👨‍🏫 المحاضر: instructor@dzlearn.dz / instructor123`);
  console.log(`🎓 طالب تجريبي: yassin@test.dz / test123`);

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
