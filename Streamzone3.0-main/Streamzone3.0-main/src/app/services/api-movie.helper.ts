import { API_CONFIG } from '../config/api.config';
import { PeliculaTransformada } from './peliculas-api.service';
import { AddMovieListPayload } from '../models/backend-api.models';

const STREAMZONE_POSTER_PLACEHOLDER = 'assets/logoStreamZone.png';

function isExternalPosterUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function looksLikeVideoUrl(value: string): boolean {
  return /\.(mp4|webm|ogg|mov|m3u8)(\?.*)?$/i.test(value);
}

export function buildPosterUrl(posterPath: string | null | undefined): string {
  const trimmed = posterPath?.trim();

  if (!trimmed || looksLikeVideoUrl(trimmed)) {
    return STREAMZONE_POSTER_PLACEHOLDER;
  }

  if (isExternalPosterUrl(trimmed)) {
    return trimmed;
  }

  return `${API_CONFIG.TMDB_IMAGE_BASE_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
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

/** Enlaza favoritos/ver más tarde con una fila existente en movies (películas manuales). */
export function toAddMovieByIdPayload(userId: number, movieId: number): AddMovieListPayload {
  return {
    user_id: Number(userId),
    movie_id: Number(movieId),
  };
}
