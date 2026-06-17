/**
 * Controller del catálogo de películas (tabla movies).
 * Gestiona listado, detalle, alta TMDB, alta manual (solo admin) y borrado (solo manuales + admin).
 */
const movieModel = require('../models/movieModel');
const { parseMovieInput, parseManualMovieInput } = require('../utils/movieValidation');
const { assertAdminRequest } = require('../utils/adminAuth');

/** GET /api/movies — catálogo completo para Home (filtra manuales en el frontend). */
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

/**
 * GET /api/movies/:id — detalle para /reproducir?origen=db&id=...
 * Devuelve video_url, poster_path y metadatos de la película persistida.
 */
async function getMovieById(req, res) {
  const movieId = Number(req.params.id);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'id debe ser un número entero válido',
    });
  }

  try {
    const movie = await movieModel.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada',
      });
    }

    return res.json({
      success: true,
      movie,
    });
  } catch (error) {
    console.error('Error en getMovieById:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

/** POST /api/movies — findOrCreate TMDB al persistir favoritos/ver más tarde. */
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

/**
 * POST /api/movies/manual — alta de catálogo por administrador.
 * Requiere cabecera x-user-id de admin@gmail.com (assertAdminRequest).
 */
async function createManualMovie(req, res) {
  const adminCheck = await assertAdminRequest(req);
  if (!adminCheck.allowed) {
    return res.status(adminCheck.status).json({
      success: false,
      message: adminCheck.message,
    });
  }

  const validation = parseManualMovieInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const movie = await movieModel.createManual(validation.data);

    return res.status(201).json({
      success: true,
      message: 'Película manual creada correctamente',
      created: true,
      movie,
    });
  } catch (error) {
    console.error('Error en createManualMovie:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

/**
 * DELETE /api/movies/:id — solo admin y solo source='manual'.
 * Películas TMDB (source='tmdb') no se pueden borrar desde la API.
 */
async function deleteMovie(req, res) {
  const adminCheck = await assertAdminRequest(req);
  if (!adminCheck.allowed) {
    return res.status(adminCheck.status).json({
      success: false,
      message: adminCheck.message,
    });
  }

  const movieId = Number(req.params.id);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'id debe ser un número entero válido',
    });
  }

  try {
    const movie = await movieModel.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada',
      });
    }

    if (movie.source !== 'manual') {
      return res.status(403).json({
        success: false,
        message: 'Solo se pueden eliminar películas manuales',
      });
    }

    const deleted = await movieModel.deleteById(movieId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada',
      });
    }

    return res.json({
      success: true,
      message: 'Película eliminada correctamente',
      id: movieId,
    });
  } catch (error) {
    console.error('Error en deleteMovie:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

module.exports = {
  getAllMovies,
  getMovieById,
  createOrGetMovie,
  createManualMovie,
  deleteMovie,
};
