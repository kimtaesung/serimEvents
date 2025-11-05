const express = require('express');
const router = express.Router();
const db = require('../database/db-adapter');

// GET 모든 기본정보 조회
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM basic_info ORDER BY info_key');
    
    // 배열을 객체로 변환하여 클라이언트에 보내기 좋게
    const basicInfo = {};
    rows.forEach(row => {
      basicInfo[row.info_key] = row.info_value;
    });
    
    res.json(basicInfo);
  } catch (error) {
    console.error('Error fetching basic info:', error);
    res.status(500).json({ error: 'Failed to fetch basic info' });
  }
});

// GET 특정 기본정보 조회
router.get('/:key', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM basic_info WHERE info_key = ?', [req.params.key]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Basic info not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching basic info:', error);
    res.status(500).json({ error: 'Failed to fetch basic info' });
  }
});

// POST 기본정보 생성 또는 업데이트
router.post('/', async (req, res) => {
  try {
    const { infoKey, infoValue, description } = req.body;
    
    if (!infoKey) {
      return res.status(400).json({ error: 'infoKey is required' });
    }
    
    // UPSERT: 존재하면 UPDATE, 없으면 INSERT
    const [result] = await db.query(
      'INSERT INTO basic_info (info_key, info_value, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE info_value = ?, description = ?',
      [infoKey, infoValue || null, description, infoValue || null, description]
    );
    
    res.json({ 
      id: result.insertId || infoKey, 
      message: 'Basic info saved successfully' 
    });
  } catch (error) {
    console.error('Error saving basic info:', error);
    res.status(500).json({ error: 'Failed to save basic info' });
  }
});

// PUT 기본정보 업데이트
router.put('/:key', async (req, res) => {
  try {
    const { infoValue, description } = req.body;
    
    const [result] = await db.query(
      'UPDATE basic_info SET info_value = ?, description = ? WHERE info_key = ?',
      [infoValue || null, description, req.params.key]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Basic info not found' });
    }
    
    res.json({ message: 'Basic info updated successfully' });
  } catch (error) {
    console.error('Error updating basic info:', error);
    res.status(500).json({ error: 'Failed to update basic info' });
  }
});

// DELETE 기본정보 삭제
router.delete('/:key', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM basic_info WHERE info_key = ?', [req.params.key]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Basic info not found' });
    }
    
    res.json({ message: 'Basic info deleted successfully' });
  } catch (error) {
    console.error('Error deleting basic info:', error);
    res.status(500).json({ error: 'Failed to delete basic info' });
  }
});

module.exports = router;
