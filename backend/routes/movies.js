const router = require('express').Router();
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');
const {
  createMovieValidation,
  deleteMovieValidation,
} = require('../validation');

router.get('/', getMovies);

router.delete('/:_id', deleteMovie);
router.post('/', createMovie);
module.exports = router;
