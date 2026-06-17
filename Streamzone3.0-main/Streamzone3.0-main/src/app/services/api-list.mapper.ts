import { ApiFavorite, ApiWatchLater } from '../models/backend-api.models';
import { buildPosterUrl } from './api-movie.helper';

export interface PeliculaListaApi {
  /** id de la fila en favorites o watch_later (para DELETE) */
  id: number;
  nombre: string;
  imagen: string;
  tmdbId?: number | null;
  movieId?: number;
  origen: 'api' | 'manual';
}

function mapMovieListItem(
  row: { id: number; movie?: { id?: number; tmdb_id?: number | null; title?: string; poster_path?: string | null; source?: string } }
): PeliculaListaApi {
  const source = row.movie?.source ?? 'tmdb';
  const isManual = source === 'manual' || row.movie?.tmdb_id == null;

  return {
    id: row.id,
    nombre: row.movie?.title ?? 'Sin título',
    imagen: buildPosterUrl(row.movie?.poster_path),
    tmdbId: row.movie?.tmdb_id ?? null,
    movieId: row.movie?.id,
    origen: isManual ? 'manual' : 'api',
  };
}

export function mapFavoriteToPelicula(fav: ApiFavorite): PeliculaListaApi {
  return mapMovieListItem(fav);
}

export function mapWatchLaterToPelicula(item: ApiWatchLater): PeliculaListaApi {
  return mapMovieListItem(item);
}
