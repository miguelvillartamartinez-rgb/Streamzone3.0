export interface ApiMovie {
  id: number;
  tmdb_id: number | null;
  title: string;
  overview: string | null;
  poster_path: string | null;
  release_date: string | null;
  genre?: string | null;
  duration_minutes?: number | null;
  video_url?: string | null;
  source?: 'tmdb' | 'manual' | 'local' | string;
  created_at?: string;
}

export interface ApiFavorite {
  id: number;
  user_id: number;
  created_at: string;
  movie: ApiMovie;
}

export interface ApiWatchLater {
  id: number;
  user_id: number;
  created_at: string;
  movie: ApiMovie;
}

export interface SessionUser {
  id: number;
  username: string;
  email: string;
}

export interface LoginApiResponse {
  success: boolean;
  message?: string;
  user?: SessionUser;
}

export interface FavoritesListResponse {
  success: boolean;
  user_id: number;
  count: number;
  favorites: ApiFavorite[];
}

export interface WatchLaterListResponse {
  success: boolean;
  user_id: number;
  count: number;
  watch_later: ApiWatchLater[];
}

export interface AddFavoriteResponse {
  success: boolean;
  message?: string;
  created?: boolean;
  favorite?: {
    id: number;
    user_id: number;
    created_at: string;
    movie: ApiMovie;
  };
}

export interface AddWatchLaterResponse {
  success: boolean;
  message?: string;
  created?: boolean;
  watch_later?: {
    id: number;
    user_id: number;
    created_at: string;
    movie: ApiMovie;
  };
}

export interface AddMovieListPayload {
  user_id: number;
  /** Película ya existente en movies (p. ej. source='manual') */
  movie_id?: number;
  /** Payload TMDB: findOrCreate por tmdb_id */
  tmdb_id?: number;
  title?: string;
  overview?: string | null;
  poster_path?: string | null;
  release_date?: string | null;
}

export interface MoviesListResponse {
  success: boolean;
  count: number;
  movies: ApiMovie[];
}

export interface MovieDetailResponse {
  success: boolean;
  message?: string;
  movie: ApiMovie;
}

export interface CreateManualMoviePayload {
  title: string;
  overview?: string | null;
  release_date?: string | null;
  genre?: string | null;
  duration_minutes?: number | null;
  poster_path?: string | null;
  video_url?: string | null;
}

export interface CreateManualMovieResponse {
  success: boolean;
  message?: string;
  created?: boolean;
  movie?: ApiMovie;
}

export interface DeleteMovieResponse {
  success: boolean;
  message?: string;
  id?: number;
}
