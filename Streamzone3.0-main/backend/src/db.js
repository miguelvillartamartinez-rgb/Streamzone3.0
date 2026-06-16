const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 3000,
});

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
