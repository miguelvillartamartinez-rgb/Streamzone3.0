/**
 * Capa de acceso a datos de usuarios (patrón Model).
 * Abstrae PostgreSQL vs JSON fallback: los controllers no saben dónde se persiste.
 */
const { pool } = require('../db');
const { getStorageMode } = require('../storage/storageMode');
const jsonUserStore = require('../storage/jsonUserStore');

/** Busca usuario por PK; no devuelve password (solo datos públicos de sesión). */
async function findById(id) {
  if ((await getStorageMode()) === 'json') {
    return jsonUserStore.findById(id);
  }

  const result = await pool.query(
    `SELECT id, username, email, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/** Usado en login/registro; incluye password para comparación en el controller. */
async function findByEmail(email) {
  if ((await getStorageMode()) === 'json') {
    return jsonUserStore.findByEmail(email);
  }

  const result = await pool.query(
    `SELECT id, username, email, password, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

/** INSERT en tabla users; devuelve fila sin password. */
async function createUser({ username, email, password }) {
  if ((await getStorageMode()) === 'json') {
    return jsonUserStore.createUser({ username, email, password });
  }

  const result = await pool.query(
    `INSERT INTO users (username, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
    [username, email, password]
  );
  return result.rows[0];
}

module.exports = {
  findById,
  findByEmail,
  createUser,
};
