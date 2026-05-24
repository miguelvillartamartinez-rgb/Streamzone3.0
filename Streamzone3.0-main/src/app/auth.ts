import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    id: number;
    email: string;
    nombre?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasStoredSession());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
        .subscribe({
          next: (response) => {
            if (response.success && response.user) {
              // Guardar sesión en localStorage solo en el navegador
              if (this.isBrowser) {
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('isAuthenticated', 'true');
              }
              this.isAuthenticatedSubject.next(true);
              resolve(true);
            } else {
              this.isAuthenticatedSubject.next(false);
              resolve(false);
            }
          },
          error: (error) => {
            console.error('Error en login:', error);
            this.isAuthenticatedSubject.next(false);
            reject(error);
          }
        });
    });
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getUser(): any {
    if (!this.isBrowser) {
      return null;
    }
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private hasStoredSession(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return localStorage.getItem('isAuthenticated') === 'true';
  }
}
