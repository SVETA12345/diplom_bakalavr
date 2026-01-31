const userRoutes = require('./users');
const testRouters = require('./tests');
const cardRoutes = require('./movies');
const cardRoutesChildren = require('./movies_children');
const httpConstants = require('http2').constants;
const { auth } = require('../middlewares/auth');
const {
  createUserValidate,
  loginValidate,
} = require('../validation');
const { login, createUser } = require('../controllers/users');

module.exports = function (app) {
  app.post('/api/signin', loginValidate, login);
  app.post('/api/signup', createUserValidate, createUser);
  app.use(auth);
  app.use('/api/users', userRoutes);
  app.use('/api/tests', testRouters);
  app.use('/api/questions', userRoutes);
  app.use('/api/attempts', cardRoutes);
  app.use('/api/sessions', cardRoutesChildren);
  app.post('/api/signout', (req, res) => {
    res.status(200).clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true, domain: '.movies-explorer.nomoreparties.co'}).send({ message: 'exit' });
    res.end();
  });
  app.use('*', (req, res) => {
    res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'тест или пользователь не найден' });
  });
};
