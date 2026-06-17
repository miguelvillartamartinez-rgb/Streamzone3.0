/**
 * Cliente HTTP de autenticación contra el backend StreamZone.
 * Tras login/register exitoso, AuthService guarda el usuario en localStorage.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginApiResponse } from '../models/backend-api.models';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  /** POST /api/users/login — devuelve { success, user: { id, username, email } }. */
  login(email: string, password: string): Observable<LoginApiResponse> {
    return this.http.post<LoginApiResponse>(`${this.apiUrl}/login`, { email, password });
  }

  /** POST /api/users/register — validación Gmail en backend y frontend. */
  register(username: string, email: string, password: string): Observable<LoginApiResponse> {
    return this.http.post<LoginApiResponse>(`${this.apiUrl}/register`, {
      username,
      email,
      password,
    });
  }
}
