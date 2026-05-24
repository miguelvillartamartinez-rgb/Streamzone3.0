const { pool } = require('../db');

async function findByUserId(userId) {
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
       m.created_at AS movie_created_at
     FROM favorites f
     INNER JOIN movies m ON m.id = f.movie_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function findByUserAndMovie(userId, movieId) {
  const result = await pool.query(
    `SELECT id, user_id, movie_id, created_at
     FROM favorites
     WHERE user_id = $1 AND movie_id = $2`,
    [userId, movieId]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await pool.query(
    `SELECT id, user_id, movie_id, created_at
     FROM favorites
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function create(userId, movieId) {
  const result = await pool.query(
    `INSERT INTO favorites (user_id, movie_id)
     VALUES ($1, $2)
     RETURNING id, user_id, movie_id, created_at`,
    [userId, movieId]
  );
  return result.rows[0];
}

async function deleteById(id) {
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
