import { SessionUser } from '../models/backend-api.models';

/**
 * Criterio único de administrador en todo el frontend.
 * Centraliza la comprobación para Home, adminGuard y alta-pelicula.
 * Sin tabla roles en BD: el admin es la cuenta seed admin@gmail.com.
 */
export const ADMIN_EMAIL = 'admin@gmail.com';

export function isAdminUser(user: SessionUser | null | undefined): boolean {
  return user?.email?.toLowerCase() === ADMIN_EMAIL;
}
