const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  order: {  // порядковый номер в тесте
    type: Number
  },
  text: {
    type: String,
  },
  testId: {
    type: String,
    required: true,
  },   // ссылка на test._id
  type: { // 'single' | 'multiple' | 'text'
    type: String,
    required: true
  },           

  points: { // вес вопроса
    type: Number,
    required: true
  },             
  options: [{             // для типов single/multiple
    text: String,
    isCorrect: Boolean,
    order: Number
  }],
  correctAnswerText: {
    type:String
   }, // для type='text' (правильный ответ текстом)
explanation: {
    type:String
}     // пояснение к правильному ответу
});

module.exports = mongoose.model('question', questionSchema);