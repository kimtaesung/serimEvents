// Node.js + Express + PostgreSQL API 예제
// 설치 필요: npm install express pg dotenv cors

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL 연결 풀 설정
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// 미들웨어
app.use(cors());
app.use(express.json());

// 에러 핸들링 헬퍼
const handleError = (res, error, message = '서버 오류가 발생했습니다') => {
  console.error(error);
  res.status(500).json({ error: message, details: error.message });
};

// GET /api/products - 모든 상품 조회 (필터링 지원)
app.get('/api/products', async (req, res) => {
  try {
    const { category, in_stock } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (in_stock !== undefined) {
      params.push(in_stock === 'true');
      query += ` AND in_stock = $${params.length}`;
    }

    query += ' ORDER BY id ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    handleError(res, error, '상품 목록을 가져오는데 실패했습니다');
  }
});

// GET /api/products/:id - 특정 상품 조회
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    handleError(res, error, '상품을 가져오는데 실패했습니다');
  }
});

// POST /api/products - 새 상품 생성
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, image, category, features, in_stock } = req.body;

    // 유효성 검사
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        error: '필수 필드가 누락되었습니다',
        required: ['name', 'description', 'price', 'category']
      });
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, image, category, features, in_stock) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, description, price, image || '', category, JSON.stringify(features || []), in_stock !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    handleError(res, error, '상품 생성에 실패했습니다');
  }
});

// PUT /api/products/:id - 상품 수정
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, features, in_stock } = req.body;

    // 상품 존재 확인
    const checkResult = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }

    const result = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           image = COALESCE($4, image),
           category = COALESCE($5, category),
           features = COALESCE($6, features),
           in_stock = COALESCE($7, in_stock)
       WHERE id = $8
       RETURNING *`,
      [name, description, price, image, category, features ? JSON.stringify(features) : null, in_stock, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    handleError(res, error, '상품 수정에 실패했습니다');
  }
});

// DELETE /api/products/:id - 상품 삭제
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }

    res.status(204).send();
  } catch (error) {
    handleError(res, error, '상품 삭제에 실패했습니다');
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 프로세스 종료 시 DB 연결 종료
process.on('SIGINT', async () => {
  await pool.end();
  process.exit();
});
