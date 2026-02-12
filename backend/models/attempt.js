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
  totalTimeSpent: {
    type: Number
  },
  totalScore: { 
    type: Number
  },     // набранные баллы
  percentage: {
    type: Number
  },     // процент правильных ответов
  passed: {
    type: Boolean
  },         // прошел ли порог passingScore
    // Все ответы с результатами проверки в одном месте
  answers: [{
    questionId: {
      type: String,
      required: true
    },
    
    // Ответ пользователя
    userAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    
    // Результаты проверки (заполняются после)
    isCorrect: {
      type: Boolean,
      default: null  // null = не проверено, true/false = результат
    },
    awardedPoints: {
      type: Number,
      default: 0
    },
    maxPoints: {
      type: Number,
      required: true  // Дублируем из question.points
    },
    
    // Для показа правильного ответа пользователю
    correctAnswer: {
      type:mongoose.Schema.Types.Mixed
    },
    explanation:{
      type:String
    },
  }],
});

module.exports = mongoose.model('attempt', attemptSchema);