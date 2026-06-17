/**
 * Autorización básica de administrador para gestión de catálogo.
 *
 * Lee la cabecera x-user-id (enviada por el interceptor Angular) y comprueba en BD
 * que el email del usuario sea admin@gmail.com.
 *
 * LIMITACIÓN: no sustituye JWT. Sin token firmado, un cliente puede falsificar x-user-id.
 * Es defensa en profundidad junto con adminGuard y ocultación de UI en el frontend.
 * La autenticación fuerte (JWT + roles) queda como mejora futura del TFG.
 */
const userModel = require('../models/userModel');

const ADMIN_EMAIL = 'admin@gmail.com';

async function assertAdminRequest(req) {
  const userId = Number(req.headers['x-user-id']);

  if (!Number.isInteger(userId) || userId <= 0) {
    return {
      allowed: false,
      status: 403,
      message: 'Acceso denegado. Se requiere cuenta de administrador.',
    };
  }

  const user = await userModel.findById(userId);

  if (!user || user.email.toLowerCase() !== ADMIN_EMAIL) {
    return {
      allowed: false,
      status: 403,
      message: 'Acceso denegado. Solo el administrador puede realizar esta acción.',
    };
  }

  return { allowed: true, user };
}

module.exports = {
  ADMIN_EMAIL,
  assertAdminRequest,
};
