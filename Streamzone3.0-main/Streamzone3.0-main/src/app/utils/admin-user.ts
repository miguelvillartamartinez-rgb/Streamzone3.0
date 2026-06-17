import { SessionUser } from '../models/backend-api.models';

export const ADMIN_EMAIL = 'admin@gmail.com';

export function isAdminUser(user: SessionUser | null | undefined): boolean {
  return user?.email?.toLowerCase() === ADMIN_EMAIL;
}
