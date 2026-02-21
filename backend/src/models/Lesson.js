const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleAr: { type: String, required: true },
  content: { type: String, required: true }, // HTML/Markdown content
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  order: { type: Number, required: true },
  type: {
    type: String,
    enum: ['video', 'article', 'pdf', 'exercise'],
    default: 'article'
  },
  videoUrl: { type: String, default: null },
  pdfUrl: { type: String, default: null },
  duration: { type: Number, default: 10 }, // minutes
  xpReward: { type: Number, default: 10 },
  isPublished: { type: Boolean, default: true },
  views: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
