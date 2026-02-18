const router = require('express').Router();
const { createAttempt, getAttempt, getAttemptsByTest, updateAttemptById } = require('../controllers/attempt');

router.post('/:testId', createAttempt);
router.get('/:attemptId', getAttempt);
router.get('/test/:testId', getAttemptsByTest);
router.patch('/', updateAttemptById)
module.exports = router;
