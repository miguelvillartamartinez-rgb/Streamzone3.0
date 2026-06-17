/**
 * Controller de "Ver más tarde".
 * Misma lógica que favoritos pero persiste en tabla watch_later.
 */
const userModel = require('../models/userModel');
const movieModel = require('../models/movieModel');
const watchLaterModel = require('../models/watchLaterModel');
const {
  parseFavoriteMovieReference,
  parseUserId,
  formatWatchLaterRow,
} = require('../utils/movieValidation');

/** GET /api/watch-later/:userId */
async function getWatchLaterByUserId(req, res) {
  const userId = parseUserId(req.params.userId);
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'userId debe ser un número entero válido',
    });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const rows = await watchLaterModel.findByUserId(userId);
    return res.json({
      success: true,
      user_id: userId,
      count: rows.length,
      watch_later: rows.map(formatWatchLaterRow),
    });
  } catch (error) {
    console.error('Error en getWatchLaterByUserId:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

/** POST /api/watch-later — findOrCreate movie + INSERT watch_later. */
async function addWatchLater(req, res) {
  const userId = parseUserId(req.body.user_id);
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'user_id debe ser un número entero válido',
    });
  }

  const reference = parseFavoriteMovieReference(req.body);
  if (!reference.valid) {
    return res.status(400).json({
      success: false,
      message: reference.message,
    });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    let movie;
    if (reference.mode === 'by_id') {
      movie = await movieModel.findById(reference.movieId);
      if (!movie) {
        return res.status(404).json({
          success: false,
          message: 'Película no encontrada',
        });
      }
    } else {
      ({ movie } = await movieModel.findOrCreate(reference.data));
    }

    const existing = await watchLaterModel.findByUserAndMovie(userId, movie.id);
    if (existing) {
      return res.json({
        success: true,
        message: 'La película ya estaba en ver más tarde',
        created: false,
        watch_later: {
          id: existing.id,
          user_id: existing.user_id,
          created_at: existing.created_at,
          movie,
        },
      });
    }

    const watchLater = await watchLaterModel.create(userId, movie.id);
    return res.status(201).json({
      success: true,
      message: 'Película añadida a ver más tarde',
      created: true,
      watch_later: {
        id: watchLater.id,
        user_id: watchLater.user_id,
        created_at: watchLater.created_at,
        movie,
      },
    });
  } catch (error) {
    console.error('Error en addWatchLater:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

/** DELETE /api/watch-later/:id */
async function deleteWatchLater(req, res) {
  const watchLaterId = parseUserId(req.params.id);
  if (!watchLaterId) {
    return res.status(400).json({
      success: false,
      message: 'id debe ser un número entero válido',
    });
  }

  try {
    const deleted = await watchLaterModel.deleteById(watchLaterId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Registro de ver más tarde no encontrado',
      });
    }

    return res.json({
      success: true,
      message: 'Registro eliminado de ver más tarde',
      id: deleted.id,
    });
  } catch (error) {
    console.error('Error en deleteWatchLater:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

module.exports = {
  getWatchLaterByUserId,
  addWatchLater,
  deleteWatchLater,
};
