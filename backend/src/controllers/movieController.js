const movieModel = require('../models/movieModel');
const { parseMovieInput } = require('../utils/movieValidation');

async function getAllMovies(req, res) {
  try {
    const movies = await movieModel.findAll();
    return res.json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error('Error en getAllMovies:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

async function createOrGetMovie(req, res) {
  const validation = parseMovieInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const { movie, created } = await movieModel.findOrCreate(validation.data);

    return res.status(created ? 201 : 200).json({
      success: true,
      message: created ? 'Película creada correctamente' : 'La película ya existía',
      created,
      movie,
    });
  } catch (error) {
    console.error('Error en createOrGetMovie:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

module.exports = {
  getAllMovies,
  createOrGetMovie,
};
