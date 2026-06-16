const { pool } = require('../db');
const { getStorageMode } = require('../storage/storageMode');
const { createListStore } = require('../storage/jsonListStore');

const jsonWatchLaterStore = createListStore('watch_later');

async function findByUserId(userId) {
  if ((await getStorageMode()) === 'json') {
    return jsonWatchLaterStore.findByUserId(userId);
  }

  const result = await pool.query(
    `SELECT
       w.id,
       w.user_id,
       w.created_at,
       m.id AS movie_id,
       m.tmdb_id,
       m.title,
       m.overview,
       m.poster_path,
       m.release_date,
       m.created_at AS movie_created_at
     FROM watch_later w
     INNER JOIN movies m ON m.id = w.movie_id
     WHERE w.user_id = $1
     ORDER BY w.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function findByUserAndMovie(userId, movieId) {
  if ((await getStorageMode()) === 'json') {
    return jsonWatchLaterStore.findByUserAndMovie(userId, movieId);
  }

  const result = await pool.query(
    `SELECT id, user_id, movie_id, created_at
     FROM watch_later
     WHERE user_id = $1 AND movie_id = $2`,
    [userId, movieId]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  if ((await getStorageMode()) === 'json') {
    return jsonWatchLaterStore.findById(id);
  }

  const result = await pool.query(
    `SELECT id, user_id, movie_id, created_at
     FROM watch_later
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function create(userId, movieId) {
  if ((await getStorageMode()) === 'json') {
    return jsonWatchLaterStore.create(userId, movieId);
  }

  const result = await pool.query(
    `INSERT INTO watch_later (user_id, movie_id)
     VALUES ($1, $2)
     RETURNING id, user_id, movie_id, created_at`,
    [userId, movieId]
  );
  return result.rows[0];
}

async function deleteById(id) {
  if ((await getStorageMode()) === 'json') {
    return jsonWatchLaterStore.deleteById(id);
  }

  const result = await pool.query(
    `DELETE FROM watch_later
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
