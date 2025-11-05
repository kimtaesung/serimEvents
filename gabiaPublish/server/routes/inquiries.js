const express = require('express');
const router = express.Router();
const db = require('../database/db-adapter');

// 모든 문의 조회 (관리자용)
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM inquiries ORDER BY created_at DESC';
    const results = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// 문의 상태 조회 (상태별 카운트)
router.get('/stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        status,
        COUNT(*) as count
      FROM inquiries
      GROUP BY status
    `;
    const results = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching inquiry stats:', error);
    res.status(500).json({ error: 'Failed to fetch inquiry stats' });
  }
});

// 특정 문의 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM inquiries WHERE id = ?';
    const results = await db.query(query, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({ error: 'Failed to fetch inquiry' });
  }
});

// 문의 생성
router.post('/', async (req, res) => {
  try {
    const {
      phone_number,
      manager_name,
      manager_address,
      product_type,
      consultation_contents,
      has_agreement
    } = req.body;

    console.log('📝 Received inquiry data:', {
      phone_number,
      manager_name,
      manager_address,
      product_type,
      consultation_contents,
      has_agreement
    });

    // 필수 필드 검증
    if (!phone_number || !manager_name || !has_agreement) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields: phone_number, manager_name, has_agreement'
      });
    }

    const query = `
      INSERT INTO inquiries (
        phone_number,
        manager_name,
        manager_address,
        product_type,
        consultation_contents,
        has_agreement,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;

    console.log('📊 Executing query with values:', [
      phone_number,
      manager_name,
      manager_address || null,
      product_type || null,
      consultation_contents || null,
      has_agreement
    ]);

    const result = await db.query(query, [
      phone_number,
      manager_name,
      manager_address || null,
      product_type || null,
      consultation_contents || null,
      has_agreement
    ]);

    console.log('✅ Inquiry saved successfully. Result:', result);

    res.status(201).json({
      success: true,
      id: result[0]?.insertId || 0,
      message: 'Inquiry created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating inquiry:', error);
    res.status(500).json({ 
      error: 'Failed to create inquiry',
      details: error.message 
    });
  }
});

// 문의 상태 업데이트 (관리자용)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const query = 'UPDATE inquiries SET status = ? WHERE id = ?';
    await db.query(query, [status, id]);

    res.json({ success: true, message: 'Inquiry status updated' });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({ error: 'Failed to update inquiry status' });
  }
});

// 문의 삭제 (관리자용)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM inquiries WHERE id = ?';
    await db.query(query, [id]);

    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

module.exports = router;
