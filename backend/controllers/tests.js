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

const deleteTest = (req, res, next) => {
  Test.findById(req.params._id)
    .orFail()
    .then((test) => {
      if (test.owner === req.user._id) {
        Test.findByIdAndRemove(req.params._id)
          .orFail()
          .then((test) => res.send({ test }))
          .catch((err) => {
            if (err.name === 'DocumentNotFoundError') {
              next(new NotFoundError('тест или пользователь не найден'));
            } else if (err.name === 'ValidationError' || err.name === 'CastError') {
              next(new BadRequestError('переданы некорректные данные в методы создания теста или пользователя'));
            }
          });
      } else { throw new UnauthorizedError('Недостаточно прав'); }
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
  getTests,
  createTest,
  deleteTest,
};
