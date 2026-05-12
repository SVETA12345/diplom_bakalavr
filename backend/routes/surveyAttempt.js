const router = require('express').Router();
const { createSurveyAttempt, getSurveyAttempt, getSurveyAttemptsBySurvey, updateSurveyAttemptById } = require('../controllers/surveyAttempt');

router.post('/:surveyId', createSurveyAttempt);
router.get('/:attemptId', getSurveyAttempt);
router.get('/survey/:surveyId', getSurveyAttemptsBySurvey);
router.patch('/', updateSurveyAttemptById)
module.exports = router;