const mongoose = require('mongoose');
const validatorEmail = require('validator');

const regex = /https?:\/\/(www\.)?\w*/;

const userSchema = new mongoose.Schema({
  name: { // у пользователя есть имя — опишем требования к имени в схеме:
    type: String, // имя — это строка
    minlength: 2, // минимальная длина имени — 2 символа
    maxlength: 30, // gender может принимать одно из трёх значений
  },
  surname: { // у пользователя есть имя — опишем требования к имени в схеме:
    type: String, // имя — это строка
    minlength: 2, // минимальная длина имени — 2 символа
    maxlength: 30, // gender может принимать одно из трёх значений
  },
  patronomic: { // у пользователя есть имя — опишем требования к имени в схеме:
    type: String, // имя — это строка
    minlength: 2, // минимальная длина имени — 2 символа
    maxlength: 30, // gender может принимать одно из трёх значений
  },
  role: {
    type: String,
    required: true,
  },
  department: {
    type: String,
  },    // для преподавателей
  group: {
    type: String,
  },           // для студентов
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator(v) {
        return validatorEmail.isEmail(v);
      },
      message: 'Неправильный email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
    default: '',
  },
});

module.exports = mongoose.model('user', userSchema);
