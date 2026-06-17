import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * Interceptores HTTP globales de StreamZone.
 * authInterceptor: adjunta x-user-id en peticiones al backend propio.
 * El backend lo usa para identificar al usuario (favoritos, adminAuth, etc.).
 * Sin JWT aún, es el vínculo sesión frontend ↔ API REST.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {

  // Las llamadas a TMDB son externas y no llevan sesión de StreamZone
  if (req.url.includes('api.themoviedb.org')) {
    return next(req);
  }

  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  let modifiedReq = req;

  if (isBrowser) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          modifiedReq = req.clone({
            setHeaders: {
              'x-user-id': String(user.id)
            }
          });
        }
      } catch {
        // Sesión corrupta: se envía la petición sin cabecera
      }
    }
  }

  return next(modifiedReq);
};


/** Registra duración de cada petición HTTP (útil en desarrollo). */
export const loggingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const started = Date.now();

  return next(req).pipe(
    tap(() => {
      const elapsed = Date.now() - started;
      console.log(`HTTP ${req.method} ${req.url} en ${elapsed} ms`);
    })
  );
};


/** Propaga errores HTTP al subscriber y los registra en consola. */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  return next(req).pipe(
    catchError(err => {
      console.error('Error HTTP global:', err);
      return throwError(() => err);
    })
  );
};
