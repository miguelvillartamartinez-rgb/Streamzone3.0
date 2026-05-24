import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/* ======================
   AUTH INTERCEPTOR
====================== */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {

  // ✅ NO tocar llamadas a TMDB
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
        // ignore parse errors
      }
    }
  }

  return next(modifiedReq);
};


/* ======================
   LOGGING INTERCEPTOR
====================== */
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


/* ======================
   ERROR INTERCEPTOR
====================== */
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








