import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, firstValueFrom, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserApiService } from './services/user-api.service';
import { SessionUser } from './models/backend-api.models';
import { GMAIL_REQUIRED_MESSAGE, isGmailEmail } from './utils/gmail-email';

export interface AuthResult {
  success: boolean;
  message?: string;
}

export type LoginResult = AuthResult;
export type RegisterResult = AuthResult;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasStoredSession());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private userApi: UserApiService) {}

  register(username: string, email: string, password: string): Promise<RegisterResult> {
    if (!isGmailEmail(email)) {
      return Promise.resolve({
        success: false,
        message: GMAIL_REQUIRED_MESSAGE,
      });
    }

    return firstValueFrom(
      this.userApi.register(username, email, password).pipe(
        map((response) => {
          if (response.success && response.user) {
            this.saveSession(response.user);
            this.isAuthenticatedSubject.next(true);
            return { success: true, message: response.message };
          }

          return {
            success: false,
            message: response.message || 'No se pudo completar el registro',
          };
        }),
        catchError((error) => {
          console.error('[StreamZone] Error en registro:', error);

          if (error?.status === 409) {
            return of({
              success: false,
              message: error?.error?.message || 'El email o nombre de usuario ya está en uso',
            });
          }

          if (error?.status === 400) {
            return of({
              success: false,
              message: error?.error?.message || 'Datos de registro inválidos',
            });
          }

          if (error?.status === 500) {
            return of({
              success: false,
              message: error?.error?.message || 'Error interno del servidor',
            });
          }

          if (error?.status === 0) {
            return of({
              success: false,
              message: 'No se pudo conectar con el servidor. Comprueba que el backend esté en marcha.',
            });
          }

          return throwError(() => error);
        })
      )
    );
  }

  login(email: string, password: string): Promise<LoginResult> {
    if (!isGmailEmail(email)) {
      return Promise.resolve({
        success: false,
        message: GMAIL_REQUIRED_MESSAGE,
      });
    }

    return firstValueFrom(
      this.userApi.login(email, password).pipe(
        map((response) => {
          if (response.success && response.user) {
            this.saveSession(response.user);
            this.isAuthenticatedSubject.next(true);
            return { success: true };
          }

          this.isAuthenticatedSubject.next(false);
          return {
            success: false,
            message: response.message || 'Email o contraseña incorrectos',
          };
        }),
        catchError((error) => {
          console.error('[StreamZone] Error en login:', error);
          this.isAuthenticatedSubject.next(false);

          if (error?.status === 401) {
            return of({
              success: false,
              message: error?.error?.message || 'Email o contraseña incorrectos',
            });
          }

          if (error?.status === 400) {
            return of({
              success: false,
              message: error?.error?.message || 'Datos de inicio de sesión inválidos',
            });
          }

          if (error?.status === 500) {
            return of({
              success: false,
              message: error?.error?.message || 'Error interno del servidor',
            });
          }

          if (error?.status === 0) {
            return of({
              success: false,
              message: 'No se pudo conectar con el servidor. Comprueba que el backend esté en marcha.',
            });
          }

          return throwError(() => error);
        })
      )
    );
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

  getUser(): SessionUser | null {
    if (!this.isBrowser) {
      return null;
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr) as SessionUser;
    } catch {
      return null;
    }
  }

  getUserId(): number | null {
    const user = this.getUser();
    if (!user || user.id === undefined || user.id === null) {
      return null;
    }

    const id = Number(user.id);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  private saveSession(user: SessionUser): void {
    if (!this.isBrowser) {
      return;
    }

    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    localStorage.setItem('user', JSON.stringify(sessionUser));
    localStorage.setItem('isAuthenticated', 'true');
  }

  private hasStoredSession(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return localStorage.getItem('isAuthenticated') === 'true';
  }
}
