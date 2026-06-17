/**
 * Cliente HTTP de favoritos (tabla favorites en PostgreSQL).
 * Al añadir, el backend hace findOrCreate de la película TMDB y luego INSERT en favorites.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AddFavoriteResponse,
  AddMovieListPayload,
  FavoritesListResponse,
} from '../models/backend-api.models';

@Injectable({
  providedIn: 'root',
})
export class FavoritesApiService {
  private readonly apiUrl = '/api/favorites';

  constructor(private http: HttpClient) {}

  /** GET /api/favorites/:userId — lista con metadatos de película embebidos. */
  getByUserId(userId: number): Observable<FavoritesListResponse> {
    return this.http.get<FavoritesListResponse>(`${this.apiUrl}/${userId}`);
  }

  /** POST /api/favorites — body: user_id + tmdb_id, title, poster_path, ... */
  add(payload: AddMovieListPayload): Observable<AddFavoriteResponse> {
    return this.http.post<AddFavoriteResponse>(this.apiUrl, payload);
  }

  /** DELETE /api/favorites/:id — id de la fila en favorites, no tmdb_id. */
  delete(favoriteId: number): Observable<{ success: boolean; message?: string; id?: number }> {
    return this.http.delete<{ success: boolean; message?: string; id?: number }>(
      `${this.apiUrl}/${favoriteId}`
    );
  }
}
