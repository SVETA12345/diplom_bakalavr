const router = require('express').Router();
const { getSurveys, createSurvey, deleteSurvey, updateSurveyById, getSurveyById } = require('../controllers/survey');

router.get('/:_id', getSurveyById);
router.get('/', getSurveys);

router.delete('/:_id', deleteSurvey);
router.post('/', createSurvey);
router.patch('/', updateSurveyById)
module.exports = router;