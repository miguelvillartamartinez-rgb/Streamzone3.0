/**
 * Cliente HTTP de "Ver más tarde" (tabla watch_later).
 * Misma forma de payload que favoritos: user_id + datos TMDB de la película.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AddMovieListPayload,
  AddWatchLaterResponse,
  WatchLaterListResponse,
} from '../models/backend-api.models';

@Injectable({
  providedIn: 'root',
})
export class WatchLaterApiService {
  private readonly apiUrl = '/api/watch-later';

  constructor(private http: HttpClient) {}

  getByUserId(userId: number): Observable<WatchLaterListResponse> {
    return this.http.get<WatchLaterListResponse>(`${this.apiUrl}/${userId}`);
  }

  add(payload: AddMovieListPayload): Observable<AddWatchLaterResponse> {
    return this.http.post<AddWatchLaterResponse>(this.apiUrl, payload);
  }

  delete(watchLaterId: number): Observable<{ success: boolean; message?: string; id?: number }> {
    return this.http.delete<{ success: boolean; message?: string; id?: number }>(
      `${this.apiUrl}/${watchLaterId}`
    );
  }
}
