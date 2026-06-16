const userModel = require('../models/userModel');
const movieModel = require('../models/movieModel');
const favoriteModel = require('../models/favoriteModel');
const {
  parseMovieInput,
  parseUserId,
  formatFavoriteRow,
} = require('../utils/movieValidation');

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

async function addFavorite(req, res) {
  const userId = parseUserId(req.body.user_id);
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'user_id debe ser un número entero válido',
    });
  }

  const validation = parseMovieInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
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

    const { movie } = await movieModel.findOrCreate(validation.data);

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
