const router = require('express').Router();
const { createAttempt, getAttempt } = require('../controllers/attempt');

router.post('/:testId', createAttempt);
router.get('/:attemptId', getAttempt);
module.exports = router;
