const QRCode = require('qrcode');
const Test = require('../models/test'); // ваша модель Test

// Генерация QR-кода
exports.generateQRCode = async (req, res) => {
  try {
    const { testId } = req.params;
    
    // Получаем тест из базы данных
    const test = await Test.findById(testId);
    
    if (!test) {
      return res.status(404).json({ message: 'Тест не найден' });
    }
    
    // Генерируем ссылку для прохождения теста
    const testUrl = `${req.protocol}://${req.get('host')}/take-test/${testId}`;
    
    // Генерируем QR-код
    const qrCodeDataURL = await QRCode.toDataURL(testUrl);
    
    // Сохраняем QR-код в базу данных
    test.qrCodeData = qrCodeDataURL;
    await test.save();
    console.log('qrCodeDataURL', qrCodeDataURL)
    res.status(200).json({
      success: true,
      qrCode: qrCodeDataURL,
      testUrl: testUrl,
      testId: testId
    });
    
  } catch (error) {
    console.error('Ошибка генерации QR-кода:', error);
    res.status(500).json({ message: 'Ошибка генерации QR-кода' });
  }
};

// Получение ссылки на тест
exports.getTestLink = async (req, res) => {
  try {
    const { testId } = req.params;
    
    const test = await Test.findById(testId);
    
    if (!test) {
      return res.status(404).json({ message: 'Тест не найден' });
    }
    
    const testUrl = `${req.protocol}://${req.get('host')}/take-test/${testId}`;
    
    res.status(200).json({
      success: true,
      testUrl: testUrl,
      qrCode: test.qrCodeData || null
    });
    
  } catch (error) {
    console.error('Ошибка получения ссылки:', error);
    res.status(500).json({ message: 'Ошибка получения ссылки' });
  }
};