const mongoose = require('mongoose');

const surveyAttemptSchema = new mongoose.Schema({
  responseNumber: {
    type: Number,  // порядковый номер ответа
  },
  
  // Данные студента (если анкета не анонимная)
  studentId: {
    type: String,
    default: null,
  },
  
  surveyId: {
    type: String,
    required: true,
  },  // ссылка на survey._id
  
  startedAt: {
    type: Date,
    default: Date.now,
  },
  finishedAt: {
    type: Date,
  },
  totalTimeSpent: {
    type: Number,  // время прохождения в секундах
  },
  
  // Ответы на вопросы анкеты
  answers: [{
    questionId: {
      type: String,
      required: true,
    },
    
    // Тип ответа:
    // 'text' - открытый текст
    // 'rating' - оценка (1-5, 1-10)
    // 'choice' - выбор одного варианта
    // 'multiple_choice' - выбор нескольких вариантов
    // 'boolean' - да/нет
    // 'scale' - шкала (например, от 1 до 10)
    questionType: {
      type: String,
      enum: ['text_short', 'text_long',  'rating', 'choice', 'multiple_choice', 'boolean', 'scale', 'matrix' ],
      required: true,
    },
    
    // Ответ пользователя (может быть разных типов)
    userAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    
    // Для вопросов с выбором - выбранные варианты
    selectedOptions: [{
      optionId: String,
      optionText: String,
    }],
    
    // Рейтинг/оценка (для вопросов типа rating/scale)
    ratingValue: {
      type: Number,
      min: 0,
      max: 10,
    },
    
    // Текстовый ответ (для вопросов типа text)
    textAnswer: {
      type: String,
    },
    
    // Дополнительные комментарии к ответу
    comment: {
      type: String,
    },
  }],
  
  // Общая статистика ответа
  isCompleted: {
    type: Boolean,
    default: false,
  },
  
  // IP-адрес или идентификатор сессии (для анонимных опросов)
  sessionId: {
    type: String,
  },
  
  submittedAt: {
    type: Date,
  },
});



module.exports = mongoose.model('surveyAttempt', surveyAttemptSchema);