/**
 * Conexión a PostgreSQL mediante pg.Pool.
 * Pool reutiliza conexiones entre peticiones HTTP (más eficiente que conectar/desconectar).
 * Credenciales leídas de variables de entorno (.env): DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD.
 */
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 3000,
});

/**
 * Comprueba que PostgreSQL responde antes de usarlo como almacenamiento principal.
 * storageMode.js llama a esta función al arrancar; si falla o hay timeout, se usa JSON fallback.
 */
async function testConnection() {
  const timeoutMs = 3000;

  const check = async () => {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  };

  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Database connection timeout')), timeoutMs);
  });

  return Promise.race([check(), timeout]);
}

module.exports = {
  pool,
  testConnection,
};
