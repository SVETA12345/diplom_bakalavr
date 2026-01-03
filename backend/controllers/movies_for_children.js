const MovieChildren = require('../models/movie_for_children');
const httpConstants = require('http2').constants;
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized');

const getMoviesChildren = (req, res, next) => {
  const owner = req.user._id;
  console.log('PFFF')
  MovieChildren.find({ owner })
    .then((movie) => res.status(httpConstants.HTTP_STATUS_OK).send(movie))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('фильм или пользователь не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные в методы создания фильма или пользователя'));
      } else {
        next(err);
      }
    });
};

const createMovieChildren = (req, res, next) => {
  const newCardData = req.body;
  newCardData.owner = req.user._id;
  return MovieChildren.create(newCardData)
    .then((newCard) => res.status(httpConstants.HTTP_STATUS_CREATED).send(newCard))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('фильм или пользователь не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные в методы создания фильма или пользователя'));
      } else {
        next(err);
      }
    });
};

const deleteMovieChildren = (req, res, next) => {
  MovieChildren.findById(req.params._id)
    .orFail()
    .then((movie) => {
      if (movie.owner === req.user._id) {
        MovieChildren.findByIdAndRemove(req.params._id)
          .orFail()
          .then((card) => res.send({ card }))
          .catch((err) => {
            if (err.name === 'DocumentNotFoundError') {
              next(new NotFoundError('фильм или пользователь не найден'));
            } else if (err.name === 'ValidationError' || err.name === 'CastError') {
              next(new BadRequestError('переданы некорректные данные в методы создания фильма или пользователя'));
            }
          });
      } else { throw new UnauthorizedError('Недостаточно прав'); }
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('фильм или пользователь не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные в методы создания фильма или пользователя'));
      } else {
        next(err);
      }
    });
};
module.exports = {
  getMoviesChildren,
  createMovieChildren,
  deleteMovieChildren,
};