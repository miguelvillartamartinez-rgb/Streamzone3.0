const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

router.get('/', movieController.getAllMovies);
router.post('/manual', movieController.createManualMovie);
router.post('/', movieController.createOrGetMovie);
router.get('/:id', movieController.getMovieById);

module.exports = router;
