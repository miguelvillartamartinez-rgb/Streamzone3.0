/**
 * Controller de favoritos.
 * Flujo al añadir: validar user_id → findOrCreate película TMDB en movies → INSERT en favorites.
 */
const userModel = require('../models/userModel');
const movieModel = require('../models/movieModel');
const favoriteModel = require('../models/favoriteModel');
const {
  parseFavoriteMovieReference,
  parseUserId,
  formatFavoriteRow,
} = require('../utils/movieValidation');

/** GET /api/favorites/:userId — lista con JOIN movies. */
async function getFavoritesByUserId(req, res) {
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

    const rows = await favoriteModel.findByUserId(userId);
    return res.json({
      success: true,
      user_id: userId,
      count: rows.length,
      favorites: rows.map(formatFavoriteRow),
    });
  } catch (error) {
    console.error('Error en getFavoritesByUserId:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

/**
 * POST /api/favorites — body incluye user_id + datos TMDB (tmdb_id, title, ...).
 * Idempotente: si ya existía el par usuario-película, devuelve 200 sin duplicar.
 */
async function addFavorite(req, res) {
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

    const existingFavorite = await favoriteModel.findByUserAndMovie(userId, movie.id);
    if (existingFavorite) {
      return res.json({
        success: true,
        message: 'El favorito ya existía',
        created: false,
        favorite: {
          id: existingFavorite.id,
          user_id: existingFavorite.user_id,
          created_at: existingFavorite.created_at,
          movie,
        },
      });
    }

    const favorite = await favoriteModel.create(userId, movie.id);
    return res.status(201).json({
      success: true,
      message: 'Favorito añadido correctamente',
      created: true,
      favorite: {
        id: favorite.id,
        user_id: favorite.user_id,
        created_at: favorite.created_at,
        movie,
      },
    });
  } catch (error) {
    console.error('Error en addFavorite:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

/** DELETE /api/favorites/:id — elimina fila de la tabla puente por id de favorito. */
async function deleteFavorite(req, res) {
  const favoriteId = parseUserId(req.params.id);
  if (!favoriteId) {
    return res.status(400).json({
      success: false,
      message: 'id debe ser un número entero válido',
    });
  }

  try {
    const deleted = await favoriteModel.deleteById(favoriteId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Favorito no encontrado',
      });
    }

    return res.json({
      success: true,
      message: 'Favorito eliminado correctamente',
      id: deleted.id,
    });
  } catch (error) {
    console.error('Error en deleteFavorite:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

module.exports = {
  getFavoritesByUserId,
  addFavorite,
  deleteFavorite,
};
