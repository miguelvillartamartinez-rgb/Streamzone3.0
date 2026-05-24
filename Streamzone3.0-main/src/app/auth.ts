import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { UserApiService } from './services/user-api.service';
import { SessionUser } from './models/backend-api.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasStoredSession());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private userApi: UserApiService) {}

  login(email: string, password: string): Promise<boolean> {
    return firstValueFrom(this.userApi.login(email, password))
      .then((response) => {
        if (response.success && response.user) {
          this.saveSession(response.user);
          this.isAuthenticatedSubject.next(true);
          return true;
        }

        this.isAuthenticatedSubject.next(false);
        return false;
      })
      .catch((error) => {
        console.error('Error en login:', error);
        this.isAuthenticatedSubject.next(false);
        throw error;
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
    return this.getUser()?.id ?? null;
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
