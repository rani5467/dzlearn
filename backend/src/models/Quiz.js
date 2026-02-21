const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  explanation: { type: String, default: '' },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: { type: Number, default: 10 }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleAr: { type: String, required: true },
  description: { type: String, default: '' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  questions: [questionSchema],
  timeLimit: { type: Number, default: 30 }, // minutes
  passingScore: { type: Number, default: 60 }, // percentage
  xpReward: { type: Number, default: 30 },
  type: {
    type: String,
    enum: ['lesson_quiz', 'practice', 'exam', 'challenge'],
    default: 'practice'
  },
  subject: {
    type: String,
    enum: ['math', 'physics', 'chemistry', 'arabic', 'french', 'english', 'history', 'biology', 'philosophy', 'islamic', 'informatics']
  },
  level: {
    type: String,
    enum: ['bem', 'bac_science', 'bac_literature', 'bac_math', 'university', 'all'],
    default: 'all'
  },
  attempts: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
