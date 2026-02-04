const Question = require('../models/question');
const Test = require('../models/test');
const httpConstants = require('http2').constants;
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized');

const getTests = (req, res, next) => {
  const owner = req.user._id;
  Test.find({ owner })
    .then((test) => res.status(httpConstants.HTTP_STATUS_OK).send(test))
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

const createTest = (req, res, next) => {
  const newCardData = req.body;
  newCardData.owner = req.user._id;
  return Test.create(newCardData)
    .then((test) => res.status(httpConstants.HTTP_STATUS_CREATED).send(test))
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

const updateTestById = (req, res, next) => {
  Test.findByIdAndUpdate(req.body._id, req.body, { new: true, runValidators: true })
    .orFail()
    .then((test) => res.send(test))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Тест уже существеут'));
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('тест не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};
const deleteTest = (req, res, next) => {
  Test.findById(req.params._id)
    .orFail()
    .then((test) => {
      if (test.owner === req.user._id) {
        // Удаляем все вопросы этого теста
        return Question.deleteMany({ testId: req.params._id })
          .then(() => {
            // После удаления вопросов удаляем сам тест
            return Test.findByIdAndDelete(req.params._id);
          })
          .then((deletedTest) => {
            res.send({ 
              message: 'Тест и все связанные вопросы успешно удалены',
              test: deletedTest 
            });
          });
      } else { 
        throw new UnauthorizedError('Недостаточно прав'); 
      }
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Тест не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else if (err.name === 'UnauthorizedError') {
        next(new UnauthorizedError('Недостаточно прав для удаления теста'));
      } else {
        next(err);
      }
    });
};
const getTestById = (req, res, next) => {
  const id = req.params._id;
  return Test.findById(id)
    .orFail()
    .then((test) => res.status(httpConstants.HTTP_STATUS_OK).send(test))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('тест не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные в метод'));
      } else {
        next(err);
      }
    });
};
module.exports = {
  getTests,
  createTest,
  updateTestById,
  deleteTest,
  getTestById
};
