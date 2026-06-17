/**
 * Comprobación ligera de administrador vía cabecera x-user-id.
 * Sin JWT la cabecera puede falsificarse; la restricción principal en UI
 * y esta capa son defensa en profundidad hasta implementar autenticación real.
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
