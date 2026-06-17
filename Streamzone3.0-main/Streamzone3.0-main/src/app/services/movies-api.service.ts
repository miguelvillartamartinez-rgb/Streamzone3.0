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

  getAll(): Observable<MoviesListResponse> {
    return this.http.get<MoviesListResponse>(this.apiUrl);
  }

  getById(id: number): Observable<MovieDetailResponse> {
    return this.http.get<MovieDetailResponse>(`${this.apiUrl}/${id}`);
  }

  createManual(payload: CreateManualMoviePayload): Observable<CreateManualMovieResponse> {
    return this.http.post<CreateManualMovieResponse>(`${this.apiUrl}/manual`, payload);
  }

  deleteManualMovie(id: number): Observable<DeleteMovieResponse> {
    return this.http.delete<DeleteMovieResponse>(`${this.apiUrl}/${id}`);
  }
}
