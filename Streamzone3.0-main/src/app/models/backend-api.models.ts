export interface ApiMovie {
  id: number;
  tmdb_id: number;
  title: string;
  overview: string | null;
  poster_path: string | null;
  release_date: string | null;
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
  tmdb_id: number;
  title: string;
  overview?: string | null;
  poster_path?: string | null;
  release_date?: string | null;
}
