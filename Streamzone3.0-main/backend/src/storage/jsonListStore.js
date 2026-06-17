/**
 * Factory para stores de listas usuario-película (favorites, watch_later) en modo JSON.
 * Simula JOIN con movies leyendo ambos archivos en memoria.
 */
const { readCollection, writeCollection, nextId, nowIso } = require('./jsonDb');

function createListStore(collectionName) {
  function joinWithMovies(items, userId) {
    const movies = readCollection('movies');

    return items
      .filter((item) => item.user_id === userId)
      .map((item) => {
        const movie = movies.find((entry) => entry.id === item.movie_id);
        if (!movie) {
          return null;
        }

        return {
          id: item.id,
          user_id: item.user_id,
          created_at: item.created_at,
          movie_id: movie.id,
          tmdb_id: movie.tmdb_id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          genre: movie.genre ?? null,
          duration_minutes: movie.duration_minutes ?? null,
          video_url: movie.video_url ?? null,
          source: movie.source ?? 'tmdb',
          movie_created_at: movie.created_at,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async function findByUserId(userId) {
    const items = readCollection(collectionName);
    return joinWithMovies(items, userId);
  }

  async function findByUserAndMovie(userId, movieId) {
    const items = readCollection(collectionName);
    return (
      items.find((item) => item.user_id === userId && item.movie_id === movieId) || null
    );
  }

  async function findById(id) {
    const items = readCollection(collectionName);
    return items.find((item) => item.id === id) || null;
  }

  async function create(userId, movieId) {
    const items = readCollection(collectionName);
    const entry = {
      id: nextId(items),
      user_id: userId,
      movie_id: movieId,
      created_at: nowIso(),
    };

    items.push(entry);
    writeCollection(collectionName, items);
    return entry;
  }

  async function deleteById(id) {
    const items = readCollection(collectionName);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }

    const [deleted] = items.splice(index, 1);
    writeCollection(collectionName, items);
    return deleted;
  }

  return {
    findByUserId,
    findByUserAndMovie,
    findById,
    create,
    deleteById,
  };
}

module.exports = {
  createListStore,
};
