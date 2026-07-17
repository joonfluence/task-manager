const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const db = {
  run: (query, params = [], callback) => {
    pool.query(query, params, (err, result) => {
      if (typeof callback === 'function') {
        callback(err);
      }
    });
  },
  get: (query, params = [], callback) => {
    pool.query(query, params, (err, result) => {
      if (typeof callback === 'function') {
        const row = result && result.rows ? result.rows[0] : null;
        callback(err, row);
      }
    });
  },
  all: (query, params = [], callback) => {
    pool.query(query, params, (err, result) => {
      if (typeof callback === 'function') {
        const rows = result && result.rows ? result.rows : [];
        callback(err, rows);
      }
    });
  }
};

// 테이블 생성
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        section TEXT NOT NULL,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'medium',
        "createdAt" TEXT NOT NULL,
        "completedAt" TEXT,
        notes TEXT,
        "dayData" TEXT
      )
    `);
    console.log('Connected to PostgreSQL database');
  } catch (err) {
    console.error('Table creation error:', err.message);
  }
})();

module.exports = db;
