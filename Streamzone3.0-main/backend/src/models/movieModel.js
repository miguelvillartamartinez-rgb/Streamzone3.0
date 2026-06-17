/**
 * Capa de acceso a datos de películas (tabla movies).
 *
 * Dos tipos principales:
 *   - TMDB (source='tmdb'): tienen tmdb_id; se crean al añadir favoritos/ver más tarde desde la API externa.
 *   - Manual (source='manual'): tmdb_id NULL; alta del admin con genre, video_url, etc.
 */
const { pool } = require('../db');
const { getStorageMode } = require('../storage/storageMode');
const jsonMovieStore = require('../storage/jsonMovieStore');

const MOVIE_COLUMNS = `
  id, tmdb_id, title, overview, poster_path, release_date,
  genre, duration_minutes, video_url, source, created_at
`;

/** Catálogo completo ordenado por título (GET /api/movies). */
async function findAll() {
  if ((await getStorageMode()) === 'json') {
    return jsonMovieStore.findAll();
  }

  const result = await pool.query(
    `SELECT ${MOVIE_COLUMNS}
     FROM movies
     ORDER BY title ASC`
  );
  return result.rows;
}

/** Detalle por id interno de StreamZone (reproducción origen=db). */
async function findById(id) {
  if ((await getStorageMode()) === 'json') {
    return jsonMovieStore.findById(id);
  }

  const result = await pool.query(
    `SELECT ${MOVIE_COLUMNS}
     FROM movies
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/** Evita duplicar la misma película TMDB al persistir favoritos/ver más tarde. */
async function findByTmdbId(tmdbId) {
  if ((await getStorageMode()) === 'json') {
    return jsonMovieStore.findByTmdbId(tmdbId);
  }

  const result = await pool.query(
    `SELECT ${MOVIE_COLUMNS}
     FROM movies
     WHERE tmdb_id = $1`,
    [tmdbId]
  );
  return result.rows[0] || null;
}

/** INSERT de película TMDB (POST /api/movies con tmdb_id). */
async function create(movieData) {
  if ((await getStorageMode()) === 'json') {
    return jsonMovieStore.create(movieData);
  }

  const { tmdb_id, title, overview, poster_path, release_date, source } = movieData;
  const result = await pool.query(
    `INSERT INTO movies (tmdb_id, title, overview, poster_path, release_date, source)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${MOVIE_COLUMNS}`,
    [tmdb_id, title, overview, poster_path, release_date, source || 'tmdb']
  );
  return result.rows[0];
}

/**
 * INSERT de película manual: tmdb_id NULL y source='manual'.
 * Incluye campos de reproducción (video_url, genre, duration_minutes).
 */
async function createManual(movieData) {
  if ((await getStorageMode()) === 'json') {
    return jsonMovieStore.createManual(movieData);
  }

  const {
    title,
    overview,
    poster_path,
    release_date,
    genre,
    duration_minutes,
    video_url,
    source,
  } = movieData;

  const result = await pool.query(
    `INSERT INTO movies (
       tmdb_id, title, overview, poster_path, release_date,
       genre, duration_minutes, video_url, source
     )
     VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${MOVIE_COLUMNS}`,
    [
      title,
      overview,
      poster_path,
      release_date,
      genre,
      duration_minutes,
      video_url,
      source || 'manual',
    ]
  );
  return result.rows[0];
}

/** Patrón idempotente: devuelve existente o inserta nueva película TMDB. */
async function findOrCreate(movieData) {
  if ((await getStorageMode()) === 'json') {
    return jsonMovieStore.findOrCreate(movieData);
  }

  const existing = await findByTmdbId(movieData.tmdb_id);
  if (existing) {
    return { movie: existing, created: false };
  }

  const movie = await create(movieData);
  return { movie, created: true };
}

/** DELETE físico; CASCADE en favorites/watch_later limpia referencias automáticamente. */
async function deleteById(id) {
  if ((await getStorageMode()) === 'json') {
    return jsonMovieStore.deleteById(id);
  }

  const result = await pool.query(
    `DELETE FROM movies WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  findAll,
  findById,
  findByTmdbId,
  create,
  createManual,
  findOrCreate,
  deleteById,
};
