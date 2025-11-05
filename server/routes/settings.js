const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// GET: 모든 사이트 설정 조회
router.get('/', async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM site_settings');
    
    // 객체 형태로 변환
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.setting_key] = {
        value: setting.setting_value,
        type: setting.setting_type,
        description: setting.description
      };
    });
    
    res.json(settingsObject);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// GET: 특정 설정 조회
router.get('/:key', async (req, res) => {
  try {
    const [settings] = await db.query(
      'SELECT * FROM site_settings WHERE setting_key = ?',
      [req.params.key]
    );
    
    if (settings.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json(settings[0]);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// PUT: 설정 업데이트 (관리자 전용)
router.put('/:key', async (req, res) => {
  const { setting_value } = req.body;
  
  try {
    const [result] = await db.query(
      'UPDATE site_settings SET setting_value = ? WHERE setting_key = ?',
      [setting_value, req.params.key]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// POST: 새 설정 추가 (관리자 전용)
router.post('/', async (req, res) => {
  const { setting_key, setting_value, setting_type, description } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES (?, ?, ?, ?)',
      [setting_key, setting_value, setting_type || 'text', description || null]
    );
    
    res.status(201).json({
      message: 'Setting created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating setting:', error);
    res.status(500).json({ error: 'Failed to create setting' });
  }
});

module.exports = router;
