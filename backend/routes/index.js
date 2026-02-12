const userRoutes = require('./users');
const testRouters = require('./tests');
const questionRouters = require('./questions');
const attemptRouters = require('./attempts');

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
  app.use('/api/attempts', attemptRouters);
  app.use('/api/users', userRoutes);
  app.use('/api/tests', testRouters);
  app.use('/api/questions', questionRouters);
  app.post('/api/signout', (req, res) => {
    res.status(200).clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true, domain: '.movies-explorer.nomoreparties.co'}).send({ message: 'exit' });
    res.end();
  });
  app.use('*', (req, res) => {
    res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'тест или пользователь не найден' });
  });
};
