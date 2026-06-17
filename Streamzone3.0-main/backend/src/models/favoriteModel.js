/**
 * Modelo de favoritos: relación N:M entre users y movies vía tabla favorites.
 * Al listar se hace JOIN con movies para devolver metadatos completos de cada película.
 */
const { pool } = require('../db');
const { getStorageMode } = require('../storage/storageMode');
const { createListStore } = require('../storage/jsonListStore');

const jsonFavoriteStore = createListStore('favorites');

/** Favoritos de un usuario con datos de película (JOIN movies). */
async function findByUserId(userId) {
  if ((await getStorageMode()) === 'json') {
    return jsonFavoriteStore.findByUserId(userId);
  }

  const result = await pool.query(
    `SELECT
       f.id,
       f.user_id,
       f.created_at,
       m.id AS movie_id,
       m.tmdb_id,
       m.title,
       m.overview,
       m.poster_path,
       m.release_date,
       m.genre,
       m.duration_minutes,
       m.video_url,
       m.source,
       m.created_at AS movie_created_at
     FROM favorites f
     INNER JOIN movies m ON m.id = f.movie_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
}

/** Comprueba duplicado antes de INSERT (constraint uq_favorites_user_movie). */
async function findByUserAndMovie(userId, movieId) {
  if ((await getStorageMode()) === 'json') {
    return jsonFavoriteStore.findByUserAndMovie(userId, movieId);
  }

  const result = await pool.query(
    `SELECT id, user_id, movie_id, created_at
     FROM favorites
     WHERE user_id = $1 AND movie_id = $2`,
    [userId, movieId]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  if ((await getStorageMode()) === 'json') {
    return jsonFavoriteStore.findById(id);
  }

  const result = await pool.query(
    `SELECT id, user_id, movie_id, created_at
     FROM favorites
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/** Añade par (user_id, movie_id) a la tabla puente favorites. */
async function create(userId, movieId) {
  if ((await getStorageMode()) === 'json') {
    return jsonFavoriteStore.create(userId, movieId);
  }

  const result = await pool.query(
    `INSERT INTO favorites (user_id, movie_id)
     VALUES ($1, $2)
     RETURNING id, user_id, movie_id, created_at`,
    [userId, movieId]
  );
  return result.rows[0];
}

async function deleteById(id) {
  if ((await getStorageMode()) === 'json') {
    return jsonFavoriteStore.deleteById(id);
  }

  const result = await pool.query(
    `DELETE FROM favorites
     WHERE id = $1
     RETURNING id`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  findByUserId,
  findByUserAndMovie,
  findById,
  create,
  deleteById,
};
