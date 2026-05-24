import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si ya está autenticado, redirigir a la página principal
  if (authService.isAuthenticated()) {
    router.navigate(['/home']);
    return false;
  }
  
  // Si no está autenticado, permitir acceso al login
  return true;
};

