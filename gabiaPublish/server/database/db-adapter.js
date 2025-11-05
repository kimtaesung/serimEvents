const mysql = require('mysql2');
require('dotenv').config();

// MySQL 연결
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'serrim123#',
  database: process.env.DB_NAME || 'serimrobo',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

const promisePool = pool.promise();

// 연결 테스트
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    return;
  }
  console.log('✅ MySQL Database connected successfully');
  connection.release();
});

// mysql2/promise의 반환값: [rows, fields]
// 따라서 query 함수는 rows 배열을 직접 반환해야 함
const db = {
  query: async (sql, params) => {
    try {
      const [rows, fields] = await promisePool.query(sql, params);
      return rows;
    } catch (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }
  },
  pool: promisePool
};

module.exports = db;
