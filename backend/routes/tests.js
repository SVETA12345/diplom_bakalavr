const router = require('express').Router();
const { getTests, createTest, deleteTest, updateTestById } = require('../controllers/tests');

router.get('/', getTests);

router.delete('/:_id', deleteTest);
router.post('/', createTest);
router.patch('/', updateTestById)
module.exports = router;