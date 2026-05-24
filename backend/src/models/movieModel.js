const { pool } = require('../db');

async function findAll() {
  const result = await pool.query(
    `SELECT id, tmdb_id, title, overview, poster_path, release_date, created_at
     FROM movies
     ORDER BY title ASC`
  );
  return result.rows;
}

async function findByTmdbId(tmdbId) {
  const result = await pool.query(
    `SELECT id, tmdb_id, title, overview, poster_path, release_date, created_at
     FROM movies
     WHERE tmdb_id = $1`,
    [tmdbId]
  );
  return result.rows[0] || null;
}

async function create({ tmdb_id, title, overview, poster_path, release_date }) {
  const result = await pool.query(
    `INSERT INTO movies (tmdb_id, title, overview, poster_path, release_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, tmdb_id, title, overview, poster_path, release_date, created_at`,
    [tmdb_id, title, overview, poster_path, release_date]
  );
  return result.rows[0];
}

async function findOrCreate(movieData) {
  const existing = await findByTmdbId(movieData.tmdb_id);
  if (existing) {
    return { movie: existing, created: false };
  }

  const movie = await create(movieData);
  return { movie, created: true };
}

module.exports = {
  findAll,
  findByTmdbId,
  create,
  findOrCreate,
};
