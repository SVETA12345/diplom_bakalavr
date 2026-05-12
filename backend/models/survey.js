const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 200,
  },
  description: {
    type: String,
    default: '',
  },
  owner: {
    type: String,  // ссылка на USERS._id (преподаватель/создатель анкеты)
    required: true,
  },
  
  // Тип анкеты: 'course_evaluation', 'feedback', 'student_satisfaction', 'general'
  surveyType: {
    type: String,
    enum: ['course_evaluation', 'feedback', 'student_satisfaction', 'general'],
    default: 'general',
  },
  
  // Для какого курса/группы/предмета анкета (опционально)
  targetCourse: {
    type: String,
    default: '',
  },
  targetSubject: {
    type: String,
    default: '',
  },
  
  // Настройки анкетирования
  isActive: {
    type: Boolean,
    default: true,
  },
  isAnonymous: {
    type: Boolean,
    default: false,  // true - анонимное анкетирование, false - с идентификацией студента
  },
  
  // Даты проведения
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  
  // Максимальное количество прохождений (обычно 1 для анкет)
  maxAttempts: {
    type: Number,
    default: 1,
  },
  
  // Показывать ли результаты после прохождения
  showResultsAfterSubmit: {
    type: Boolean,
    default: false,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  
  // QR-код для быстрого доступа к анкете
  qrCodeData: {
    type: String,
  },
});

// Автоматическое обновление updatedAt при сохранении
surveySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('survey', surveySchema);