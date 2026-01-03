const router = require('express').Router();
const { getMoviesChildren, createMovieChildren, deleteMovieChildren } = require('../controllers/movies_for_children');
const {
  createMovieValidation,
  deleteMovieValidation,
} = require('../validation');
router.get('/', getMoviesChildren);

router.delete('/:_id', deleteMovieChildren);
router.post('/', createMovieChildren);
module.exports = router;
