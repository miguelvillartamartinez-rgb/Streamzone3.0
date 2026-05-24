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

  if (imagen.includes('image.tmdb.org')) {
    return imagen.replace(API_CONFIG.TMDB_IMAGE_BASE_URL, '');
  }

  return imagen;
}

export function toAddMovieListPayload(
  userId: number,
  pelicula: PeliculaTransformada
): AddMovieListPayload {
  const releaseDate =
    pelicula.fechaLanzamiento && pelicula.fechaLanzamiento !== 'Fecha no disponible'
      ? pelicula.fechaLanzamiento
      : null;

  return {
    user_id: userId,
    tmdb_id: pelicula.id,
    title: pelicula.nombre,
    overview: pelicula.descripcion,
    poster_path: extractPosterPath(pelicula.imagen),
    release_date: releaseDate,
  };
}
