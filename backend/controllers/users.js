const User = require('../models/user');
const httpConstants = require('http2').constants;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized');
require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

const getUserById = (req, res, next) => {
  const id = req.user._id;
  return User.findById(id)
    .orFail()
    .then((user) => res.status(httpConstants.HTTP_STATUS_OK).send(user))
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

const updateUserById = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('пользователь уже существеут'));
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('фильм или пользователь не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные в методы создания фильма или пользователя'));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  console.log('yes')
  const { email, password } = req.body;
  if (!email || !password) {
    console.log(1)
    throw new BadRequestError('переданы некорректные данные в методы создания карточки, пользователя, обновления аватара пользователя или профиля');
  }
  return User.find({ email }).select('+password')
    .then(() => {
      console.log(req.body.email)
      bcrypt.hash(req.body.password, 10, (err, hash) => User.create({
        email: req.body.email,
        name: req.body.name,
        password: hash, // записываем хеш в базу
      })
        .then(() => res.send({ message: 'Вы успешно зарегистрировались' }))
        .catch((err) => {
          console.log(err)
          if (err.code === 11000) {
            next(new ConflictError('пользователь уже существеут'));
          } else {
            next(new BadRequestError('переданы некорректные данные в методы создания карточки, пользователя, обновления аватара пользователя или профиля'));
          }
        }));
    })
    .catch((err) => {
      console.log(err)
      next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    throw new BadRequestError('переданы некорректные данные в методы создания фильма или пользователя');
  }

  return User.findOne({ email }).select('password')
    .then((admin) => {
      if (!admin) {
        throw new UnauthorizedError('Такого пользователя не существует');
      }
      // Load hash from your password DB.
      return bcrypt.compare(password, admin.password)
        .then((isValidPassword) => {
          // result == true
          if (!isValidPassword) {
            throw new UnauthorizedError('Неправильный пароль');
          }
          // Создать и отдать токен
          // создадим токен
          const token = jwt.sign({ _id: admin._id }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', { expiresIn: '7d' });
          // вернём токен
          res.status(200).cookie('jwt', token, {
            maxAge: 6400000,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
          });
          console.log(req.cookies)
          console.log('token Back', token);
          res.send({ token });
        });
    })
    .catch((err) => { next(err); });
};

module.exports = {
  getUserById,
  updateUserById,
  login,
  createUser,
};
