const db = require('./db-adapter');
require('dotenv').config();

// 하위 호환성을 위해 기존 인터페이스 유지
module.exports = {
  pool: db.pool,
  promisePool: db.pool,
  query: (sql, params) => db.query(sql, params)
};
