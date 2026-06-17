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
