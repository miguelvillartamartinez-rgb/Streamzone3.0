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

  login(email: string, password: string): Observable<LoginApiResponse> {
    return this.http.post<LoginApiResponse>(`${this.apiUrl}/login`, { email, password });
  }

  register(username: string, email: string, password: string): Observable<LoginApiResponse> {
    return this.http.post<LoginApiResponse>(`${this.apiUrl}/register`, {
      username,
      email,
      password,
    });
  }
}
