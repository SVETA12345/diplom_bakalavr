const { celebrate, Joi } = require('celebrate');

const regex = /https?:\/\/(www\.)?\w*/;

const createMovieValidation = celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.object().required(),
    trailerLink: Joi.string().required().pattern(regex),
    thumbnail: Joi.string().required().pattern(regex),
    id: Joi.number().required(),
    nameRU: Joi.string().required().pattern(/^[А-Яа-яЁё ]+$/),
    nameEN: Joi.string().required().pattern(/^[A-Za-z ]+$/),
  }),
});

const deleteMovieValidation = celebrate({
  params: Joi.object().keys({
    _id: Joi.string().hex().length(24),
  }),
});

const updateUserAvatarValidate = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string().required().min(2).max(30),
  }),
});

const createUserValidate = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

const loginValidate = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

module.exports = {
  createMovieValidation,
  deleteMovieValidation,
  updateUserAvatarValidate,
  createUserValidate,
  loginValidate,
};
