const jwt = require('jsonwebtoken');
require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;
const auth = (req, res, next) => {
  // тут будет вся авторизация
  const authorization = req.cookies.jwt;
  if (!authorization) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }

  const token = authorization.replace('jwt=', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (err) {
    console.log('err', err)
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }

  req.user = payload;
  console.log(req.user) // записываем пейлоуд в объект запроса
  next(); // пропускаем запрос дальше
};

module.exports = {
  auth,
};
