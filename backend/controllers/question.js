const Question = require('../models/question');
const httpConstants = require('http2').constants;
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized');

//возвращаем все вопросы теста
const getQuestions = (req, res, next) => {
  const testId = req.params.testId;
  Question.find({ testId })
    .then((questions) => res.status(httpConstants.HTTP_STATUS_OK).send(questions))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('тест или пользователь не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const createQuestion = (req, res, next) => {
  const newCardData = req.body;
  console.log('Question', Question)
  return Question.create(newCardData)
    .then((question) => res.status(httpConstants.HTTP_STATUS_CREATED).send(question))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('тест или пользователь не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const updateQuestionById = (req, res, next) => {
  Question.findByIdAndUpdate(req.body._id, req.body, { new: true, runValidators: true })
    .orFail()
    .then((question) => res.send(question))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Вопрос уже существеут'));
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('вопрос не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};
const deleteQuestion = (req, res, next) => {
  Question.findById(req.params._id)
    .orFail()
    .then((test) => {
        Question.findByIdAndRemove(req.params._id)
          .orFail()
          .then((test) => res.send({ test }))
          .catch((err) => {
            if (err.name === 'DocumentNotFoundError') {
              next(new NotFoundError('вопрос не найден'));
            } else if (err.name === 'ValidationError' || err.name === 'CastError') {
              next(new BadRequestError('переданы некорректные данные в метод удаления вопроса'));
            }
          });
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('тест или пользователь не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные в методы создания теста или пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getQuestions,
  createQuestion,
  updateQuestionById,
  deleteQuestion,
};
