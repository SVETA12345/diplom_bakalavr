const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  name: { // у пользователя есть имя — опишем требования к имени в схеме:
    type: String, // имя — это строка
    minlength: 2, // минимальная длина имени — 2 символа
    maxlength: 30, // gender может принимать одно из трёх значений
  },
  description: {
    type: String,
  },
  owner: {
    type: String,
    required: true,
  },   // ссылка на USERS._id (преподаватель)
  subject: {
    type: String,
    required: true
  },           // дисциплина

  duration: {
    type: Number,
    required: true
  },             // время на прохождение в минутах (0 = без ограничения)

  maxAttempts:{
    type: Number
 },     // максимальное количество попыток

 showCorrectAnswers: {
    type: Boolean,
    required: true
 }, // показывать ли правильные ответы после прохождения
 passingScore: {
    type: Number,
    required: true
 },    // минимальный балл для зачета (%)
 createdAt: {
    type: Date,
    required: true
 },
 qrCodeData: {
    type:String
 }
});

module.exports = mongoose.model('test', testSchema);