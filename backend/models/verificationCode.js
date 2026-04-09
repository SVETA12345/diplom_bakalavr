// models/VerificationCode.js
const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['password_reset', 'email_verification', 'two_factor'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => Date.now() + 15 * 60 * 1000 // 15 минут
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Автоматическое удаление просроченных кодов
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);