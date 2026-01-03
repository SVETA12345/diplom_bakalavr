const mongoose = require('mongoose');

const regex = /https?:\/\/(www\.)?\w*/;

const cardSchema = new mongoose.Schema({
  country: {
    type: String, // имя — это строка
    required: true,
  },
  director: {
    type: String, // имя — это строка
    required: true,
  },
  duration: {
    type: Number, // имя — это строка
    required: true,
  },
  year: {
    type: String, // имя — это строка
    required: true,
  },
  description: {
    type: String, // имя — это строка
    required: true,
  },
  image: {
    type: Object, // гендер — это строка
    required: true, // оно должно быть у каждого пользователя\
  },
  trailerLink: {
    type: String, // гендер — это строка
    required: true, // оно должно быть у каждого пользователя\
    validate: {
      validator(v) {
        return regex.test(v);
      },
      message: 'Неправильная ссылка',
    },
  },
  owner: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  nameRU: {
    type: String,
    required: true,
  },
  nameEN: {
    type: String,
    required: true,
  },
});


module.exports = mongoose.model('movie', cardSchema);

