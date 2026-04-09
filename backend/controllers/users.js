const User = require('../models/user');

// controllers/user.js (обновленная версия)
const VerificationCode = require('../models/verificationCode');
const { generateVerificationCode, sendVerificationEmail } = require('../utils/emailService');

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
  bcrypt.hash(req.body.password, 10, (err, hash) =>
  User.findByIdAndUpdate(req.user._id, {...req.body,
    password: hash
  }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('пользователь уже существеут'));
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('фильм или пользователь не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные в методы создания пользователя'));
      } else {
        next(err);
      }
    })
  );
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
        password: hash,
        role: req.body.role,
        department: req.body.department,
        surname: req.body.surname,
        patronomic: req.body.patronomic, 
        group: req.body.group
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

// Отправка кода подтверждения для сброса пароля
const sendPasswordResetCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Проверяем, существует ли пользователь
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('Пользователь с таким email не найден');
    }
    
    // Удаляем старые неиспользованные коды для этого email
    await VerificationCode.deleteMany({ 
      email, 
      type: 'password_reset',
      used: false 
    });
    
    // Генерируем новый код
    const code = generateVerificationCode();
    
    // Сохраняем код в БД
    await VerificationCode.create({
      email,
      code,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });
    
    // Отправляем email
    await sendVerificationEmail(email, code, 'password_reset');
    
    res.status(200).json({ 
      message: 'Код подтверждения отправлен на email',
      email: email // Можно вернуть email для использования на фронтенде
    });
  } catch (err) {
    next(err);
  }
};

// Подтверждение кода и сброс пароля
const verifyCodeAndResetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    
    // Ищем код в БД
    const verificationCode = await VerificationCode.findOne({
      email,
      code,
      type: 'password_reset',
      used: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!verificationCode) {
      throw new BadRequestError('Неверный или просроченный код подтверждения');
    }
    
    // Помечаем код как использованный
    verificationCode.used = true;
    await verificationCode.save();
    
    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Обновляем пароль пользователя
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );
    
    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }
    
    res.status(200).json({ 
      message: 'Пароль успешно изменен' 
    });
  } catch (err) {
    next(err);
  }
};

// Двухфакторная аутентификация при входе
const sendTwoFactorCode = async (req, res, next) => {
  console.log('sdeee')
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }
    
    // Удаляем старые коды
    await VerificationCode.deleteMany({ 
      email, 
      type: 'two_factor',
      used: false 
    });
    
    // Генерируем код
    const code = generateVerificationCode();
    
    // Сохраняем код
    await VerificationCode.create({
      email,
      code,
      type: 'two_factor',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });
    
    // Отправляем email
    await sendVerificationEmail(email, code, 'two_factor');
    
    res.status(200).json({ 
      message: 'Код подтверждения отправлен на email',
      requiresTwoFactor: true
    });
  } catch (err) {
    next(err);
  }
};

// Обновленная функция логина с двухфакторной аутентификацией
const loginWithTwoFactor = async (req, res, next) => {
  try {
    const { email, password, twoFactorCode } = req.body;
    
    // Проверяем email и пароль
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Неверный email или пароль');
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Неверный email или пароль');
    }
    
    // Если двухфакторный код не предоставлен, отправляем запрос на его отправку
    if (!twoFactorCode) {
      // Отправляем код на email
      const code = generateVerificationCode();
      await VerificationCode.create({
        email,
        code,
        type: 'two_factor',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      });
      await sendVerificationEmail(email, code, 'two_factor');
      
      return res.status(200).json({ 
        requiresTwoFactor: true,
        message: 'Код подтверждения отправлен на email'
      });
    }
    
    // Проверяем двухфакторный код
    const verificationCode = await VerificationCode.findOne({
      email,
      code: twoFactorCode,
      type: 'two_factor',
      used: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!verificationCode) {
      throw new UnauthorizedError('Неверный или просроченный код подтверждения');
    }
    
    // Помечаем код как использованный
    verificationCode.used = true;
    await verificationCode.save();
    
    // Создаем токен
    const token = jwt.sign(
      { _id: user._id }, 
      NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', 
      { expiresIn: '7d' }
    );
    
    res.status(200).cookie('jwt', token, {
      maxAge: 6400000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    console.log('token', token, 'user', user)
    console.log('Cookie set. Headers:', res.getHeaders());
    res.send({ token, admin: user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserById,
  updateUserById,
  login: loginWithTwoFactor, // Заменяем старую функцию логина
  createUser,
  sendPasswordResetCode,
  verifyCodeAndResetPassword,
  sendTwoFactorCode
};