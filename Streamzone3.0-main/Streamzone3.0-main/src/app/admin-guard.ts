/**
 * Guard de ruta para gestión de catálogo (solo administrador).
 * Se combina con authGuard en /alta-pelicula: primero sesión, luego email admin@gmail.com.
 * Usuarios normales son redirigidos a /home sin acceder al formulario de alta.
 */
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth';
import { isAdminUser } from './utils/admin-user';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (isAdminUser(authService.getUser())) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};
