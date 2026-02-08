const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  attemptNumber: { // номер попытки (1, 2, 3...): {  // порядковый номер в тесте
    type: Number
  },
  studentId: {
    type: String,
    required: true,
  },
  testId: {
    type: String,
    required: true,
  },   // ссылка на test._id
  startedAt: {
    type: Date
  },
  finishedAt: {
    type: Date
  },
  totalScore: { 
    type: Number
  },     // набранные баллы
  percentage: {
    tupe: Number
  },     // процент правильных ответов
  passed: {
    type: Boolean
  }         // прошел ли порог passingScore
});

module.exports = mongoose.model('attempt', attemptSchema);