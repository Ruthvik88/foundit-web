const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || '';
const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString: connectionString,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = pool;
