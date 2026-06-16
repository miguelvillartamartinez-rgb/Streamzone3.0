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

  getByUserId(userId: number): Observable<FavoritesListResponse> {
    return this.http.get<FavoritesListResponse>(`${this.apiUrl}/${userId}`);
  }

  add(payload: AddMovieListPayload): Observable<AddFavoriteResponse> {
    return this.http.post<AddFavoriteResponse>(this.apiUrl, payload);
  }

  delete(favoriteId: number): Observable<{ success: boolean; message?: string; id?: number }> {
    return this.http.delete<{ success: boolean; message?: string; id?: number }>(
      `${this.apiUrl}/${favoriteId}`
    );
  }
}
