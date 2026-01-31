const router = require('express').Router();
const { getTests, createTest, deleteTest } = require('../controllers/tests');

router.get('/', getTests);

router.delete('/:_id', deleteTest);
router.post('/', createTest);
module.exports = router;