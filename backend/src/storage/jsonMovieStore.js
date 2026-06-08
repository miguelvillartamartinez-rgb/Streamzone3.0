const { readCollection, writeCollection, nextId, nowIso } = require('./jsonDb');

async function findAll() {
  return readCollection('movies');
}

async function findByTmdbId(tmdbId) {
  const movies = readCollection('movies');
  return movies.find((item) => item.tmdb_id === tmdbId) || null;
}

async function create(movieData) {
  const movies = readCollection('movies');
  const movie = {
    id: nextId(movies),
    ...movieData,
    created_at: nowIso(),
  };

  movies.push(movie);
  writeCollection('movies', movies);
  return movie;
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
