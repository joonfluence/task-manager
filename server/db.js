const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const db = {
  run: (query, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    const q = params && params.length > 0 ? pool.query(query, params) : pool.query(query);
    q.then(() => callback(null)).catch(err => callback(err));
  },
  get: (query, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    const q = params && params.length > 0 ? pool.query(query, params) : pool.query(query);
    q.then(result => {
      const row = result && result.rows ? result.rows[0] : null;
      callback(null, row);
    }).catch(err => callback(err, null));
  },
  all: (query, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    const q = params && params.length > 0 ? pool.query(query, params) : pool.query(query);
    q.then(result => {
      const rows = result && result.rows ? result.rows : [];
      callback(null, rows);
    }).catch(err => callback(err, []));
  }
};

// 테이블 생성
(async () => {
  try {
    // 개발 환경에서는 테이블 재생성 (마이그레이션 목적)
    if (process.env.NODE_ENV !== 'production') {
      try {
        await pool.query('DROP TABLE IF EXISTS tasks');
      } catch (dropErr) {
        // 무시
      }
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        section TEXT NOT NULL,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'medium',
        createdat TEXT NOT NULL,
        completedat TEXT,
        notes TEXT,
        daydata TEXT
      )
    `);
    console.log('Connected to PostgreSQL database');
  } catch (err) {
    console.error('Table creation error:', err.message);
  }
})();

module.exports = db;
