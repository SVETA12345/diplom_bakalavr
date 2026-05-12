const router = require('express').Router();
const {   getQuestions,
  createQuestion,
  updateQuestionById,
  deleteQuestion } = require('../controllers/surveyQuestion');

router.get('/:surveyId', getQuestions);

router.delete('/:_id', deleteQuestion);
router.post('/', createQuestion);
router.patch('/', updateQuestionById)
module.exports = router;