// utils/emailService.js
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config(); 
const { EMAIL_USER, EMAIL_PASSWORD } = process.env;
// Настройка транспортера (пример для Gmail)
const transporter = nodemailer.createTransport({
   host: 'smtp.mail.ru',
  port: 465,
  secure: true, // true для 465 порта
  auth: {
    user: EMAIL_USER, // ваш email на mail.ru
    pass: EMAIL_PASSWORD // ваш обычный пароль от почты
  }
});

const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendVerificationEmail = async (email, code, type) => {
  let subject, html;
  
  switch(type) {
    case 'password_reset':
      subject = 'Код для сброса пароля';
      html = `
        <h2>Сброс пароля</h2>
        <p>Ваш код для сброса пароля: <strong>${code}</strong></p>
        <p>Код действителен в течение 15 минут.</p>
        <p>Если вы не запрашивали сброс пароля, проигнорируйте это сообщение.</p>
      `;
      break;
    case 'two_factor':
      subject = 'Код двухфакторной аутентификации';
      html = `
        <h2>Вход в аккаунт</h2>
        <p>Ваш код для входа: <strong>${code}</strong></p>
        <p>Код действителен в течение 15 минут.</p>
      `;
      break;
    default:
      subject = 'Код подтверждения';
      html = `<p>Ваш код подтверждения: <strong>${code}</strong></p>`;
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: html
  };
  
  await transporter.sendMail(mailOptions);
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail
};