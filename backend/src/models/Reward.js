const mongoose = require('mongoose');
const rewardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['badge', 'certificate', 'prize', 'discount', 'other'], default: 'badge' },
  icon: { type: String, default: '🏆' },
  xpRequired: { type: Number, default: 0 },
  streakRequired: { type: Number, default: 0 },
  coursesRequired: { type: Number, default: 0 },
  quizzesRequired: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  claimedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalClaimed: { type: Number, default: 0 },
  maxClaims: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.model('Reward', rewardSchema);
