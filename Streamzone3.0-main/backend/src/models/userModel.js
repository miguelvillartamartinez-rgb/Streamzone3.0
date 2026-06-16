const { pool } = require('../db');
const { getStorageMode } = require('../storage/storageMode');
const jsonUserStore = require('../storage/jsonUserStore');

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
