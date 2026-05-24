import { API_CONFIG } from '../config/api.config';
import { PeliculaTransformada } from './peliculas-api.service';
import { AddMovieListPayload } from '../models/backend-api.models';

export function buildPosterUrl(posterPath: string | null | undefined): string {
  if (!posterPath) {
    return 'assets/logoStreamZone.png';
  }

  if (posterPath.startsWith('http')) {
    return posterPath;
  }

  return `${API_CONFIG.TMDB_IMAGE_BASE_URL}${posterPath}`;
}

export function extractPosterPath(imagen: string): string | null {
  if (!imagen || imagen.includes('assets/')) {
    return null;
  }

  const tmdbMatch = imagen.match(/image\.tmdb\.org\/t\/p\/w\d+(\/.+)$/);
  if (tmdbMatch?.[1]) {
    return tmdbMatch[1];
  }

  if (imagen.startsWith('/')) {
    return imagen;
  }

  return null;
}

export function toAddMovieListPayload(
  userId: number,
  pelicula: PeliculaTransformada
): AddMovieListPayload {
  const posterPath = pelicula.poster_path ?? extractPosterPath(pelicula.imagen);

  return {
    user_id: Number(userId),
    tmdb_id: Number(pelicula.id),
    title: pelicula.nombre?.trim() || 'Sin título',
    overview: pelicula.descripcion ?? '',
    poster_path: posterPath,
    release_date: pelicula.release_date,
  };
}
