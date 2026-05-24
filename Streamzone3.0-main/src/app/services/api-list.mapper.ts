import { ApiFavorite, ApiWatchLater } from '../models/backend-api.models';
import { buildPosterUrl } from './api-movie.helper';

export interface PeliculaListaApi {
  /** id de la fila en favorites o watch_later (para DELETE) */
  id: number;
  nombre: string;
  imagen: string;
  tmdbId: number;
  origen: 'api';
}

export function mapFavoriteToPelicula(fav: ApiFavorite): PeliculaListaApi {
  return {
    id: fav.id,
    nombre: fav.movie?.title ?? 'Sin título',
    imagen: buildPosterUrl(fav.movie?.poster_path),
    tmdbId: fav.movie?.tmdb_id ?? 0,
    origen: 'api',
  };
}

export function mapWatchLaterToPelicula(item: ApiWatchLater): PeliculaListaApi {
  return {
    id: item.id,
    nombre: item.movie?.title ?? 'Sin título',
    imagen: buildPosterUrl(item.movie?.poster_path),
    tmdbId: item.movie?.tmdb_id ?? 0,
    origen: 'api',
  };
}
