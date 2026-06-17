/**
 * Validación y normalización de payloads de películas.
 * Separa reglas TMDB (tmdb_id obligatorio) vs manual (title obligatorio, sin tmdb_id).
 */

/** Películas TMDB: obligatorios tmdb_id (entero > 0) y title. Usado en favoritos/ver más tarde. */
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
      source: 'tmdb',
    },
  };
}

function parseOptionalPositiveInt(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return { error: 'duration_minutes debe ser un entero positivo' };
  }

  return parsed;
}

/** Acepta AAAA o AAAA-MM-DD; normaliza año solo a YYYY-01-01. */
function normalizeReleaseDate(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const raw = String(value).trim();

  if (/^\d{4}$/.test(raw)) {
    return `${raw}-01-01`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  return { error: 'release_date debe ser AAAA o AAAA-MM-DD' };
}

/**
 * Películas manuales (POST /api/movies/manual).
 * Obligatorio: title. Opcionales con límites de longitud: genre, poster_path, video_url.
 * Siempre asigna source='manual' y tmdb_id=null.
 */
function parseManualMovieInput(body) {
  const { title, overview, release_date, genre, duration_minutes, poster_path, video_url } = body;

  if (title === undefined || title === null || String(title).trim() === '') {
    return {
      valid: false,
      message: 'title es obligatorio',
    };
  }

  const trimmedTitle = String(title).trim();
  if (trimmedTitle.length > 150) {
    return {
      valid: false,
      message: 'title no puede superar 150 caracteres',
    };
  }

  const parsedDuration = parseOptionalPositiveInt(duration_minutes);
  if (parsedDuration && typeof parsedDuration === 'object' && parsedDuration.error) {
    return { valid: false, message: parsedDuration.error };
  }

  const parsedReleaseDate = normalizeReleaseDate(release_date);
  if (parsedReleaseDate && typeof parsedReleaseDate === 'object' && parsedReleaseDate.error) {
    return { valid: false, message: parsedReleaseDate.error };
  }

  const trimmedGenre = genre === undefined || genre === null ? null : String(genre).trim();
  const trimmedOverview = overview === undefined || overview === null ? null : String(overview).trim();
  const trimmedPoster = poster_path === undefined || poster_path === null ? null : String(poster_path).trim();
  const trimmedVideoUrl = video_url === undefined || video_url === null ? null : String(video_url).trim();

  if (trimmedGenre && trimmedGenre.length > 100) {
    return {
      valid: false,
      message: 'genre no puede superar 100 caracteres',
    };
  }

  if (trimmedPoster && trimmedPoster.length > 255) {
    return {
      valid: false,
      message: 'poster_path no puede superar 255 caracteres',
    };
  }

  if (trimmedVideoUrl && trimmedVideoUrl.length > 512) {
    return {
      valid: false,
      message: 'video_url no puede superar 512 caracteres',
    };
  }

  return {
    valid: true,
    data: {
      tmdb_id: null,
      title: trimmedTitle,
      overview: trimmedOverview || null,
      poster_path: trimmedPoster || null,
      release_date: parsedReleaseDate || null,
      genre: trimmedGenre || null,
      duration_minutes: typeof parsedDuration === 'number' ? parsedDuration : null,
      video_url: trimmedVideoUrl || null,
      source: 'manual',
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

/**
 * Resuelve cómo enlazar favoritos/ver más tarde con movies:
 *   - movie_id → película ya existente (p. ej. source='manual')
 *   - tmdb_id + title → findOrCreate TMDB (comportamiento anterior)
 */
function parseFavoriteMovieReference(body) {
  const movieId = parseUserId(body.movie_id);
  if (movieId) {
    return { valid: true, mode: 'by_id', movieId };
  }

  const tmdbValidation = parseMovieInput(body);
  if (!tmdbValidation.valid) {
    return tmdbValidation;
  }

  return { valid: true, mode: 'tmdb', data: tmdbValidation.data };
}

/** Unifica filas JOIN (favorites/watch_later + movies) al DTO ApiMovie del frontend. */
function formatMovie(row) {
  return {
    id: row.movie_id ?? row.id,
    tmdb_id: row.tmdb_id ?? null,
    title: row.title,
    overview: row.overview ?? null,
    poster_path: row.poster_path ?? null,
    release_date: row.release_date ?? null,
    genre: row.genre ?? null,
    duration_minutes: row.duration_minutes ?? null,
    video_url: row.video_url ?? null,
    source: row.source ?? 'tmdb',
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
  parseManualMovieInput,
  parseUserId,
  parseFavoriteMovieReference,
  formatMovie,
  formatFavoriteRow,
  formatWatchLaterRow,
};
