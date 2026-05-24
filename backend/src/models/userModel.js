const { pool } = require('../db');

async function findByEmail(email) {
  const result = await pool.query(
    `SELECT id, username, email, password, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

async function createUser({ username, email, password }) {
  const result = await pool.query(
    `INSERT INTO users (username, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
    [username, email, password]
  );
  return result.rows[0];
}

module.exports = {
  findByEmail,
  createUser,
};
