/**
 * Rutas del catálogo — montadas en /api/movies
 * Orden: rutas fijas (/manual) antes de /:id para evitar colisiones en Express.
 */
const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

router.get('/', movieController.getAllMovies);
router.post('/manual', movieController.createManualMovie);
router.post('/', movieController.createOrGetMovie);
router.get('/:id', movieController.getMovieById);
router.delete('/:id', movieController.deleteMovie);

module.exports = router;
