function parseMovieInput(body) {
  const { tmdb_id, title, overview, poster_path, release_date } = body;

  if (tmdb_id === undefined || tmdb_id === null || title === undefined || title === null) {
    return {
      valid: false,
      message: 'tmdb_id y title son obligatorios',
    };
  }

  const parsedTmdbId = Number(tmdb_id);
  const trimmedTitle = String(title).trim();

  if (!Number.isInteger(parsedTmdbId) || parsedTmdbId <= 0) {
    return {
      valid: false,
      message: 'tmdb_id debe ser un número entero válido',
    };
  }

  if (trimmedTitle === '') {
    return {
      valid: false,
      message: 'title no puede estar vacío',
    };
  }

  return {
    valid: true,
    data: {
      tmdb_id: parsedTmdbId,
      title: trimmedTitle,
      overview: overview ?? null,
      poster_path: poster_path ?? null,
      release_date: release_date || null,
    },
  };
}

function parseUserId(value) {
  const userId = Number(value);
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }
  return userId;
}

function formatMovie(row) {
  return {
    id: row.movie_id ?? row.id,
    tmdb_id: row.tmdb_id,
    title: row.title,
    overview: row.overview,
    poster_path: row.poster_path,
    release_date: row.release_date,
    created_at: row.movie_created_at ?? row.created_at,
  };
}

function formatFavoriteRow(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    created_at: row.created_at,
    movie: formatMovie(row),
  };
}

function formatWatchLaterRow(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    created_at: row.created_at,
    movie: formatMovie(row),
  };
}

module.exports = {
  parseMovieInput,
  parseUserId,
  formatMovie,
  formatFavoriteRow,
  formatWatchLaterRow,
};
