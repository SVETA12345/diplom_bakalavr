const mongoose = require('mongoose');

const surveyQuestionSchema = new mongoose.Schema({
  order: {
    type: Number,  // порядковый номер вопроса в анкете
    required: true
  },
  text: {
    type: String,
    required: true  // текст вопроса
  },
  surveyId: {
    type: String,
    required: true,
  },   // ссылка на survey._id
  
  // Типы вопросов для анкетирования:
  // 'single_choice' - одиночный выбор
  // 'multiple_choice' - множественный выбор
  // 'rating' - рейтинг/оценка (1-5, 1-10)
  // 'scale' - шкала согласия (Ликерта)
  // 'text_short' - короткий текст (одна строка)
  // 'text_long' - длинный текст (много строк)
  // 'boolean' - да/нет
  // 'matrix' - матрица (несколько параметров для оценки)
  type: {
    type: String,
    enum: ['choice', 'multiple_choice', 'rating', 'scale', 'text_short', 'text_long', 'boolean', 'matrix'],
    required: true
  },
  
  // Вес вопроса (если нужна статистика важности)
  weight: {
    type: Number,
    default: 1
  },
  
  // Обязательный ли вопрос
  required: {
    type: Boolean,
    default: true
  },
  
  // Для типов single_choice / multiple_choice
  options: [{
    text: String,        // текст варианта ответа
    value: Number,       // числовое значение (для подсчета статистики)
    order: Number,       // порядок отображения
    hasCommentField: {   // можно ли оставить комментарий к этому варианту
      type: Boolean,
      default: false
    }
  }],
  
  // Для типа rating - настройки шкалы
  ratingSettings: {
    minValue: {
      type: Number,
      default: 1
    },
    maxValue: {
      type: Number,
      default: 5
    },
    minLabel: String,    // например, "Очень плохо"
    maxLabel: String,    // например, "Отлично"
    step: {
      type: Number,
      default: 1
    }
  },
  
  // Для типа scale (шкала Ликерта)
  scaleSettings: {
    points: [String],    // например: ["Полностью не согласен", "Не согласен", "Нейтрально", "Согласен", "Полностью согласен"]
    pointsCount: {
      type: Number,
      default: 5
    }
  },
  
  // Для текстовых вопросов
  textSettings: {
    maxLength: Number,   // максимальная длина текста
    placeholder: String, // текст-подсказка
    rows: Number         // количество строк для text_long (textarea)
  },
  
  // Для матричных вопросов (оценка нескольких параметров)
  matrixSettings: {
    rows: [String],      // строки матрицы (параметры для оценки)
    columns: [String],   // колонки матрицы (варианты оценок)
    columnValues: [Number] // числовые значения колонок
  },
  
  
  
  // Пояснение к вопросу
  explanation: {
    type: String
  },
  

  
});



module.exports = mongoose.model('surveyQuestion', surveyQuestionSchema);