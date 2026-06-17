/**
 * Cliente HTTP del catálogo persistido en PostgreSQL/JSON (tabla movies).
 * Proxy Angular redirige /api/movies → backend Express en :4000.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateManualMoviePayload,
  CreateManualMovieResponse,
  DeleteMovieResponse,
  MovieDetailResponse,
  MoviesListResponse,
} from '../models/backend-api.models';

@Injectable({
  providedIn: 'root',
})
export class MoviesApiService {
  private readonly apiUrl = '/api/movies';

  constructor(private http: HttpClient) {}

  /** GET /api/movies — Home filtra source='manual' en el componente. */
  getAll(): Observable<MoviesListResponse> {
    return this.http.get<MoviesListResponse>(this.apiUrl);
  }

  /** GET /api/movies/:id — usado por /reproducir?origen=db&id=... */
  getById(id: number): Observable<MovieDetailResponse> {
    return this.http.get<MovieDetailResponse>(`${this.apiUrl}/${id}`);
  }

  /** POST /api/movies/manual — requiere sesión admin (x-user-id vía interceptor). */
  createManual(payload: CreateManualMoviePayload): Observable<CreateManualMovieResponse> {
    return this.http.post<CreateManualMovieResponse>(`${this.apiUrl}/manual`, payload);
  }

  /** DELETE /api/movies/:id — solo películas manuales y solo admin. */
  deleteManualMovie(id: number): Observable<DeleteMovieResponse> {
    return this.http.delete<DeleteMovieResponse>(`${this.apiUrl}/${id}`);
  }
}
