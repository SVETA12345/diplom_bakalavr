// routes/qrRoutes.js
const router = require('express').Router();
const qrController = require('../controllers/qrController');

// Генерация QR-кода
router.get('/generate-qr/:testId', qrController.generateQRCode);

// Получение ссылки на тест
router.get('/test-link/:testId', qrController.getTestLink);

module.exports = router;