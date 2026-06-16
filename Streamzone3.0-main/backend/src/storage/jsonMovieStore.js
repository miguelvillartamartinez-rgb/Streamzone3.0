const { readCollection, writeCollection, nextId, nowIso } = require('./jsonDb');

async function findAll() {
  return readCollection('movies');
}

async function findById(id) {
  const movies = readCollection('movies');
  return movies.find((item) => item.id === id) || null;
}

async function findByTmdbId(tmdbId) {
  const movies = readCollection('movies');
  return movies.find((item) => item.tmdb_id === tmdbId) || null;
}

async function create(movieData) {
  const movies = readCollection('movies');
  const movie = {
    id: nextId(movies),
    tmdb_id: movieData.tmdb_id,
    title: movieData.title,
    overview: movieData.overview ?? null,
    poster_path: movieData.poster_path ?? null,
    release_date: movieData.release_date ?? null,
    genre: movieData.genre ?? null,
    duration_minutes: movieData.duration_minutes ?? null,
    video_url: movieData.video_url ?? null,
    source: movieData.source ?? 'tmdb',
    created_at: nowIso(),
  };

  movies.push(movie);
  writeCollection('movies', movies);
  return movie;
}

async function createManual(movieData) {
  return create({
    ...movieData,
    tmdb_id: null,
    source: 'manual',
  });
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
  findById,
  findByTmdbId,
  create,
  createManual,
  findOrCreate,
};
